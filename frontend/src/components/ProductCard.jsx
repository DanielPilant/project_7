import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import PackInteractions from "./PackInteractions.jsx";
import styles from "./ProductCard.module.css";

// A single sound-pack card. Cover/title link to the details page; the
// like + comment bar sits outside the link so it doesn't trigger navigation.
export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(product.id);

  return (
    <div className={styles.card}>
      <Link to={`/products/${product.id}`} className={styles.link}>
        <div className={styles.cover}>
          {product.cover_image_url ? (
            <img src={product.cover_image_url} alt={product.title} />
          ) : (
            <span className={styles.placeholder}>🎵</span>
          )}
        </div>

        <div className={styles.body}>
          <div>
            <h3 className={styles.title}>{product.title}</h3>
            <p className={styles.creator}>
              by {product.creator_name || "Unknown creator"}
            </p>
          </div>
          <span className={styles.price}>
            ${Number(product.price ?? 0).toFixed(2)}
          </span>
        </div>
      </Link>

      <div className={styles.footer}>
        <PackInteractions product={product} />
        {user && (
          <button
            className={inCart ? styles.cartBtnDone : styles.cartBtn}
            onClick={() => !inCart && addToCart(product)}
            disabled={inCart}
          >
            {inCart ? "✓" : "+🛒"}
          </button>
        )}
      </div>
    </div>
  );
}

