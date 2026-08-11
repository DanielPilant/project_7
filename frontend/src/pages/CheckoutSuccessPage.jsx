import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

// Landing page after a successful Stripe checkout redirect.
export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  // Clear the cart on mount (user was redirected here after payment).
  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section style={{ textAlign: "center", padding: "3rem 0" }}>
      <h1>🎉 Payment Successful!</h1>
      <p>Thank you for your purchase. Your files are ready to download.</p>
      <Link to="/downloads" className="btn" style={{ marginTop: "1rem", display: "inline-flex" }}>
        Go to My Downloads
      </Link>
    </section>
  );
}
