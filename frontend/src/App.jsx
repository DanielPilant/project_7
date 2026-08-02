import { Routes, Route, Link } from "react-router-dom";
import CatalogPage from "./pages/CatalogPage.jsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import RequireRole from "./auth/RequireRole.jsx";
import { useAuth } from "./auth/AuthContext.jsx";

// Top-level layout + route table for the Product Catalog feature.
export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="app__header">
        <Link to="/" className="app__logo">
          SoundForge 🎛️
        </Link>

        {user ? (
          <>
            <Link
              to="/profile"
              className="app__nav-link app__nav-link--right"
            >
              Profile
            </Link>
            <button className="app__nav-link app__nav-link--btn" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="app__nav-link app__nav-link--right">
              Log in
            </Link>
            <Link to="/register" className="app__nav-link">
              Register
            </Link>
          </>
        )}
      </header>

      <main className="app__main">
        <Routes>
          <Route
            path="/"
            element={
              <RequireRole>
                <CatalogPage />
              </RequireRole>
            }
          />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route
            path="/upload"
            element={
              <RequireRole role={["creator", "admin"]}>
                <UploadPage />
              </RequireRole>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <AdminPage />
              </RequireRole>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </div>
  );
}
