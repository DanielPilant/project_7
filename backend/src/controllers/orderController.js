import Stripe from "stripe";
import * as orderModel from "../models/orderModel.js";
import * as productModel from "../models/productModel.js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// POST /api/orders/checkout
// Creating a Stripe Checkout Session from the cart items.
export const createCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        error:
          "Stripe is not configured. Use the manual checkout endpoint for testing.",
      });
    }

    const { items } = req.body; // [{ productId, quantity: 1 }]
    if (!items?.length) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    const productIds = items.map((i) => i.productId);
    const dbProducts = await orderModel.getProductPrices(productIds);

    if (dbProducts.length !== productIds.length) {
      return res
        .status(400)
        .json({ error: "One or more products no longer exist." });
    }

    const lineItems = dbProducts.map((p) => ({
      price_data: {
        currency: "usd",
        product_data: { name: p.title },
        unit_amount: Math.round(Number(p.price) * 100), // cents
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/cart`,
      metadata: {
        userId: String(req.user.id),
        productIds: JSON.stringify(productIds),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session." });
  }
};

// POST /api/orders/webhook
// Stripe webhook: finalize the order after successful payment.
export const handleStripeWebhook = async (req, res) => {
  try {
    if (!stripe) return res.status(503).send("Stripe not configured");

    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = Number(session.metadata.userId);
      const productIds = JSON.parse(session.metadata.productIds);

      // Look up current prices to lock them at purchase time.
      const dbProducts = await orderModel.getProductPrices(productIds);
      const totalAmount = dbProducts.reduce(
        (sum, p) => sum + Number(p.price),
        0,
      );
      const orderItems = dbProducts.map((p) => ({
        productId: p.id,
        price: Number(p.price),
      }));

      await orderModel.createOrder(userId, totalAmount, orderItems);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed." });
  }
};

// POST /api/orders/manual
// Dev fallback: create an order directly (no Stripe).
export const createOrderManual = async (req, res) => {
  try {
    const { items } = req.body; // [{ productId }]
    if (!items?.length) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    const productIds = items.map((i) => i.productId);
    const dbProducts = await orderModel.getProductPrices(productIds);

    if (dbProducts.length !== productIds.length) {
      return res
        .status(400)
        .json({ error: "One or more products no longer exist." });
    }

    const totalAmount = dbProducts.reduce(
      (sum, p) => sum + Number(p.price),
      0,
    );
    const orderItems = dbProducts.map((p) => ({
      productId: p.id,
      price: Number(p.price),
    }));

    const orderId = await orderModel.createOrder(
      req.user.id,
      totalAmount,
      orderItems,
    );

    res.status(201).json({
      success: true,
      orderId,
      totalAmount,
      itemCount: orderItems.length,
    });
  } catch (error) {
    console.error("Error creating manual order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
};

// GET /api/orders/mine
export const getMyOrders = async (req, res) => {
  try {
    const orders = await orderModel.getOrdersByUser(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
};

// GET /api/orders/download/:productId
// Protected download: only users who purchased the product may download.
export const downloadProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user.id;

    const purchased = await orderModel.hasUserPurchasedProduct(
      userId,
      productId,
    );
    if (!purchased) {
      return res.status(403).json({
        error: "Access denied. You have not purchased this product.",
      });
    }

    const product = await productModel.getProductById(productId);
    if (!product || !product.zip_file_url) {
      return res
        .status(404)
        .json({ error: "Product or download file not found." });
    }

    // Redirect to the S3 file URL for download.
    res.redirect(product.zip_file_url);
  } catch (error) {
    console.error("Error downloading product:", error);
    res.status(500).json({ error: "Failed to download product." });
  }
};
