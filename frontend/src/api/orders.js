import api from "./axios.js";

// Create a Stripe Checkout Session; returns { url } to redirect to.
export function createCheckoutSession(items) {
  return api
    .post("/orders/checkout", { items })
    .then((res) => res.data);
}

// Dev fallback: create an order directly without Stripe.
export function createOrderManual(items) {
  return api
    .post("/orders/manual", { items })
    .then((res) => res.data);
}

// Fetch the current user's order history.
export function fetchMyOrders() {
  return api.get("/orders/mine").then((res) => res.data);
}

// Build the download URL for a purchased product.
export function getDownloadUrl(productId) {
  const base = api.defaults.baseURL || "/api";
  return `${base}/orders/download/${productId}`;
}
