import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  createCheckoutSession,
  handleStripeWebhook,
  createOrderManual,
  getMyOrders,
  downloadProduct,
} from "../controllers/orderController.js";

const router = express.Router();

// Stripe checkout
router.post("/checkout", authenticateToken, createCheckoutSession);

// Stripe webhook (no auth — Stripe sends this; raw body handled in index.js)
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// Dev fallback: create order without Stripe
router.post("/manual", authenticateToken, createOrderManual);

// User's order history
router.get("/mine", authenticateToken, getMyOrders);

// Protected download
router.get("/download/:productId", authenticateToken, downloadProduct);

export default router;
