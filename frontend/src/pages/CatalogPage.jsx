import { useEffect, useState } from "react";
import { fetchProducts } from "../api/products.js";
import ProductCard from "../components/ProductCard.jsx";
import SearchBar from "../components/SearchBar.jsx";

// Home page: search bar + responsive grid of sound-pack cards.
export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading"); // loading | success | error

  // Fetch the full list once; searching filters it locally (no extra API calls).
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

  // Only packs whose title starts with the typed letters (case-insensitive).
  const visibleProducts = products.filter((product) =>
    product.title.toLowerCase().startsWith(search.toLowerCase()),
  );

  return (
    <section>
      <h1>Sound Pack Catalog</h1>
      <SearchBar value={search} onChange={setSearch} />

      {status === "loading" && <p>Loading…</p>}
      {status === "error" && (
        <p className="msg--error">
          Couldn’t load products. Is the backend running?
        </p>
      )}
      {status === "success" && visibleProducts.length === 0 && (
        <p>No products found.</p>
      )}

      <div className="grid">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
