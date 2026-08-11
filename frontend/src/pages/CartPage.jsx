import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { createCheckoutSession, createOrderManual } from "../api/orders.js";
import styles from "./CartPage.module.css";

export default function CartPage() {
  const { user } = useAuth();
  const { cart, removeFromCart, clearCart, cartTotal } = useCart();
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  async function handleStripeCheckout() {
    setStatus("loading");
    setError("");
    try {
      const items = cart.map((item) => ({ productId: item.id }));
      const { url } = await createCheckoutSession(items);
      window.location.href = url;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setStatus("error");
    }
  }

  async function handleManualCheckout() {
    setStatus("loading");
    setError("");
    try {
      const items = cart.map((item) => ({ productId: item.id }));
      await createOrderManual(items);
      clearCart();
      setStatus("success");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section className={styles.wrap}>
        <h1>🎉 Order Placed!</h1>
        <p>Your purchase was successful.</p>
        <Link to="/downloads" className="btn">
          Go to My Downloads
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.wrap}>
      <h1>Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className={styles.empty}>
          <p>Your cart is empty.</p>
          <Link to="/" className="btn">
            Browse Packs
          </Link>
        </div>
      ) : (
        <>
          <ul className={styles.list}>
            {cart.map((item) => (
              <li key={item.id} className={styles.item}>
                <div className={styles.itemCover}>
                  {item.cover_image_url ? (
                    <img src={item.cover_image_url} alt={item.title} />
                  ) : (
                    <span className={styles.placeholder}>🎵</span>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <Link
                    to={`/products/${item.id}`}
                    className={styles.itemTitle}
                  >
                    {item.title}
                  </Link>
                  {item.creator_name && (
                    <p className={styles.itemCreator}>
                      by {item.creator_name}
                    </p>
                  )}
                </div>
                <span className={styles.itemPrice}>
                  ${item.price.toFixed(2)}
                </span>
                <button
                  className={`btn--danger ${styles.removeBtn}`}
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.summary}>
            <div className={styles.total}>
              <span>Total</span>
              <span className={styles.totalAmount}>
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <div className={styles.actions}>
              <button
                className="btn"
                onClick={handleStripeCheckout}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Processing…" : "Checkout with Stripe"}
              </button>
              <button
                className="btn btn--ghost"
                onClick={handleManualCheckout}
                disabled={status === "loading"}
              >
                Quick Checkout (Dev)
              </button>
            </div>

            {error && <p className="msg--error">{error}</p>}
          </div>
        </>
      )}
    </section>
  );
}
