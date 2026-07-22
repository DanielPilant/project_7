import { Link } from 'react-router-dom';

// A single sound-pack card in the catalog grid.
// Wrapped in a Link so the whole card navigates to the details page.
export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="card">
      <div className="card__cover">
        {product.cover_image_url ? (
          <img src={product.cover_image_url} alt={product.title} />
        ) : (
          <span className="card__placeholder">🎵</span>
        )}
      </div>

      <div className="card__body">
        <h3 className="card__title">{product.title}</h3>
        <span className="card__price">
          ${Number(product.price ?? 0).toFixed(2)}
        </span>
      </div>
    </Link>
  );
}
