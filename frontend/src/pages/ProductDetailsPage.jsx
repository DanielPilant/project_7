import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductById } from "../api/products.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import PackInteractions from "../components/PackInteractions.jsx";
import styles from "./ProductDetailsPage.module.css";

// Details page: one product's extended info + demo audio + like/comments.
export default function ProductDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    let active = true;
    setStatus("loading");

    fetchProductById(id)
      .then((data) => {
        if (!active) return;
        setProduct(data);
        setStatus("success");
      })
      .catch(() => active && setStatus("error"));

    return () => {
      active = false;
    };
  }, [id]);

  if (status === "loading") return <p>Loading…</p>;
  if (status === "error" || !product) {
    return <p className="msg--error">Product not found.</p>;
  }

  const inCart = isInCart(product.id);

  return (
    <article className={styles.wrap}>
      <Link to="/" className={styles.back}>
        ← Back to catalog
      </Link>
      <h1 className={styles.title}>{product.title}</h1>
      <p className={styles.creator}>
        by {product.creator_name || "Unknown creator"}
      </p>

      {product.cover_image_url && (
        <img
          className={styles.cover}
          src={product.cover_image_url}
          alt={product.title}
        />
      )}

      <div className={styles.priceRow}>
        <p className={styles.price}>${Number(product.price ?? 0).toFixed(2)}</p>
        {user && (
          <button
            className={inCart ? "btn btn--ghost" : "btn"}
            onClick={() => !inCart && addToCart(product)}
            disabled={inCart}
          >
            {inCart ? "In Cart ✓" : "Add to Cart"}
          </button>
        )}
      </div>

      <p className={styles.desc}>{product.description}</p>

      {product.demo_audio_url && (
        <audio className={styles.audio} controls src={product.demo_audio_url}>
          Your browser does not support the audio element.
        </audio>
      )}

      <PackInteractions product={product} />
    </article>
  );
}

