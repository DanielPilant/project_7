import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../api/products.js';

// Details page: shows one product's extended info + demo audio.
export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    let active = true;
    setStatus('loading');

    fetchProductById(id)
      .then((data) => {
        if (!active) return;
        setProduct(data);
        setStatus('success');
      })
      .catch(() => active && setStatus('error'));

    return () => {
      active = false;
    };
  }, [id]);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'error' || !product) {
    return <p className="msg--error">Product not found.</p>;
  }

  return (
    <article className="details">
      <Link to="/">← Back to catalog</Link>
      <h1>{product.title}</h1>

      {product.cover_image_url && (
        <img className="details__cover" src={product.cover_image_url} alt={product.title} />
      )}

      <p className="details__price">${Number(product.price ?? 0).toFixed(2)}</p>
      <p>{product.description}</p>

      {product.demo_audio_url && (
        <audio controls src={product.demo_audio_url}>
          Your browser does not support the audio element.
        </audio>
      )}

      {/* TODO (other features): add-to-cart button, creator info, purchase/download */}
    </article>
  );
}
