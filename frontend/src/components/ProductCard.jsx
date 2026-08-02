import { Link } from 'react-router-dom';
import PackInteractions from './PackInteractions.jsx';

// A single sound-pack card in the catalog grid. The cover/title link to the
// details page; the like + comment bar sits outside the link so its buttons
// don't trigger navigation.
export default function ProductCard({ product }) {
  return (
    <div className="card">
      <Link to={`/products/${product.id}`} className="card__link">
        <div className="card__cover">
          {product.cover_image_url ? (
            <img src={product.cover_image_url} alt={product.title} />
          ) : (
            <span className="card__placeholder">🎵</span>
          )}
        </div>

        <div className="card__body">
          <div>
            <h3 className="card__title">{product.title}</h3>
            <p className="card__creator">by {product.creator_name || 'Unknown creator'}</p>
          </div>
          <span className="card__price">
            ${Number(product.price ?? 0).toFixed(2)}
          </span>
        </div>
      </Link>

      <div className="card__footer">
        <PackInteractions product={product} />
      </div>
    </div>
  );
}
