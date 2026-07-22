import { useEffect, useState } from 'react';
import { fetchProducts } from '../api/products.js';
import ProductCard from '../components/ProductCard.jsx';
import SearchBar from '../components/SearchBar.jsx';

// Home page: search bar + responsive grid of sound-pack cards.
export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('loading'); // loading | success | error

  // Re-fetch whenever the search term changes.
  // TODO: debounce so we don't hit the API on every keystroke.
  useEffect(() => {
    let active = true;
    setStatus('loading');

    fetchProducts(search)
      .then((data) => {
        if (!active) return;
        setProducts(data);
        setStatus('success');
      })
      .catch(() => active && setStatus('error'));

    return () => {
      active = false;
    };
  }, [search]);

  return (
    <section>
      <h1>Sound Pack Catalog</h1>
      <SearchBar value={search} onChange={setSearch} />

      {status === 'loading' && <p>Loading…</p>}
      {status === 'error' && (
        <p className="msg--error">Couldn’t load products. Is the backend running?</p>
      )}
      {status === 'success' && products.length === 0 && <p>No products found.</p>}

      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
