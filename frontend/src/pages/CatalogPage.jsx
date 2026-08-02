import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api/products.js";
import ProductCard from "../components/ProductCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import styles from "./CatalogPage.module.css";

// Home page: featured "Hot Pack" hero + search + responsive grid.
export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    let active = true;
    setStatus("loading");

    fetchProducts()
      .then((data) => {
        if (!active) return;
        setProducts(data);
        setStatus("success");
      })
      .catch(() => active && setStatus("error"));

    return () => {
      active = false;
    };
  }, []);

  // Filter locally by title prefix (case-insensitive).
  const visibleProducts = products.filter((p) =>
    p.title.toLowerCase().startsWith(search.toLowerCase()),
  );

  // The most-liked pack drives the hero (falls back to the newest).
  const featured = products.length
    ? [...products].sort(
        (a, b) => Number(b.like_count) - Number(a.like_count),
      )[0]
    : null;

  return (
    <section>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Browse Sound Packs</h1>
          <p className={styles.subtitle}>
            Fresh loops, one-shots &amp; kits from the community 🎛️
          </p>
        </div>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {featured && !search && (
        <div className={styles.hero}>
          <span className={styles.glow} />
          <div className={styles.heroBody}>
            <span className={styles.label}>🔥 Hot Pack</span>
            <h2 className={styles.heroTitle}>{featured.title}</h2>
            <p className={styles.heroMeta}>
              by {featured.creator_name || "Unknown"} · ❤ {featured.like_count}{" "}
              likes
            </p>
            <Link to={`/products/${featured.id}`} className={styles.heroBtn}>
              Try it now →
            </Link>
          </div>
          {featured.cover_image_url ? (
            <img
              className={styles.heroCover}
              src={featured.cover_image_url}
              alt={featured.title}
            />
          ) : (
            <div className={`${styles.heroCover} ${styles.heroCoverFallback}`}>
              🎵
            </div>
          )}
        </div>
      )}

      {status === "loading" && <p>Loading…</p>}
      {status === "error" && (
        <p className="msg--error">
          Couldn&apos;t load packs. Is the backend running?
        </p>
      )}
      {status === "success" && visibleProducts.length === 0 && (
        <p className={styles.empty}>No packs match your search.</p>
      )}

      <div className={styles.grid}>
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
