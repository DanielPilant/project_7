import Stripe from "stripe";
import * as orderModel from "../models/orderModel.js";
import * as productModel from "../models/productModel.js";
import { getSignedDownloadUrl } from "../services/s3Service.js";
import { AppError } from "../utils/httpError.js";

// Checkout, order creation and the purchase check that guards downloads.
// Prices are always re-read from the DB — a cart arriving from the browser is
// treated as a list of ids and nothing more.

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const isStripeConfigured = () => stripe !== null;

// Turn [{ productId }] into DB-verified rows, a total, and order line items.
const priceCart = async (items) => {
  if (!items?.length) throw new AppError(400, "Cart is empty.");

  const productIds = items.map((i) => i.productId);
  const dbProducts = await orderModel.getProductPrices(productIds);

  if (dbProducts.length !== productIds.length) {
    throw new AppError(400, "One or more products no longer exist.");
  }

  return {
    productIds,
    dbProducts,
    totalAmount: dbProducts.reduce((sum, p) => sum + Number(p.price), 0),
    orderItems: dbProducts.map((p) => ({
      productId: p.id,
      price: Number(p.price),
    })),
  };
};

export const createCheckoutSession = async (userId, items) => {
  if (!stripe) {
    throw new AppError(
      503,
      "Stripe is not configured. Use the manual checkout endpoint for testing.",
    );
  }

  const { productIds, dbProducts } = await priceCart(items);

  const lineItems = dbProducts.map((p) => ({
    price_data: {
      currency: "usd",
      product_data: { name: p.title },
      unit_amount: Math.round(Number(p.price) * 100), // cents
    },
    quantity: 1,
  }));

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/cart`,
    metadata: {
      userId: String(userId),
      productIds: JSON.stringify(productIds),
    },
  });

  return { url: session.url };
};

// Verifies the Stripe signature. Throws the raw Stripe error so the controller
// can echo its message, which is what Stripe's CLI expects to see.
export const constructWebhookEvent = (rawBody, signature) =>
  stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

// Payment succeeded: re-read prices and write the order.
export const fulfillCheckoutSession = async (session) => {
  const userId = Number(session.metadata.userId);
  const productIds = JSON.parse(session.metadata.productIds);

  const items = productIds.map((productId) => ({ productId }));
  const { totalAmount, orderItems } = await priceCart(items);

  return await orderModel.createOrder(userId, totalAmount, orderItems);
};

// Dev fallback: create an order directly, no Stripe.
export const createManualOrder = async (userId, items) => {
  const { totalAmount, orderItems } = await priceCart(items);

  const orderId = await orderModel.createOrder(userId, totalAmount, orderItems);

  return { orderId, totalAmount, itemCount: orderItems.length };
};

export const getMyOrders = async (userId) =>
  await orderModel.getOrdersByUser(userId);

// Only users who purchased the product may download it.
export const getDownloadUrl = async (userId, productId) => {
  const purchased = await orderModel.hasUserPurchasedProduct(userId, productId);
  if (!purchased) {
    throw new AppError(
      403,
      "Access denied. You have not purchased this product.",
    );
  }

  const product = await productModel.getProductById(productId);
  if (!product || !product.zip_file_url) {
    throw new AppError(404, "Product or download file not found.");
  }

  // The pack lives under a private S3 prefix, so a bare URL would be rejected.
  // Now that the purchase is confirmed, hand back a link that expires shortly.
  return await getSignedDownloadUrl(
    product.zip_file_url,
    `${product.title}.zip`,
  );
};
