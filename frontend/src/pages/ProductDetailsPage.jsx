import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductById } from "../api/products.js";
import PackInteractions from "../components/PackInteractions.jsx";
import styles from "./ProductDetailsPage.module.css";

// Details page: one product's extended info + demo audio + like/comments.
export default function ProductDetailsPage() {
  const { id } = useParams();
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

      <p className={styles.price}>${Number(product.price ?? 0).toFixed(2)}</p>
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
