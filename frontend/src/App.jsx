import { Routes, Route, Link } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductDetailsPage from './pages/ProductDetailsPage.jsx';

// Top-level layout + route table for the Product Catalog feature.
export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <Link to="/" className="app__logo">SoundForge 🎛️</Link>
        {/* TODO: nav links (login, cart, dashboard) get added by other features */}
      </header>

      <main className="app__main">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
        </Routes>
      </main>
    </div>
  );
}
