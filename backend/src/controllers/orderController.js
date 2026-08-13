import * as orderService from "../services/orderService.js";
import { respondWithError } from "../utils/httpError.js";

// HTTP only. Pricing, Stripe and the purchase check live in
// services/orderService.js; SQL lives in models/orderModel.js.

// POST /api/orders/checkout
export const createCheckoutSession = async (req, res) => {
  try {
    const session = await orderService.createCheckoutSession(
      req.user.id,
      req.body.items,
    );
    res.json(session);
  } catch (error) {
    respondWithError(
      res,
      error,
      "Error creating checkout session:",
      "Failed to create checkout session.",
    );
  }
};

// POST /api/orders/webhook
// Stripe posts here directly, so the responses stay plain text the way Stripe's
// tooling expects rather than the JSON the rest of the API returns.
export const handleStripeWebhook = async (req, res) => {
  try {
    if (!orderService.isStripeConfigured()) {
      return res.status(503).send("Stripe not configured");
    }

    let event;
    try {
      event = orderService.constructWebhookEvent(
        req.body,
        req.headers["stripe-signature"],
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      await orderService.fulfillCheckoutSession(event.data.object);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed." });
  }
};

// POST /api/orders/manual
export const createOrderManual = async (req, res) => {
  try {
    const result = await orderService.createManualOrder(
      req.user.id,
      req.body.items,
    );
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    respondWithError(
      res,
      error,
      "Error creating manual order:",
      "Failed to create order.",
    );
  }
};

// GET /api/orders/mine
export const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    respondWithError(res, error, "Error fetching orders:", "Failed to fetch orders.");
  }
};

// GET /api/orders/download/:productId
export const downloadProduct = async (req, res) => {
  try {
    const url = await orderService.getDownloadUrl(
      req.user.id,
      req.params.productId,
    );
    res.json({ url });
  } catch (error) {
    respondWithError(
      res,
      error,
      "Error downloading product:",
      "Failed to download product.",
    );
  }
};
