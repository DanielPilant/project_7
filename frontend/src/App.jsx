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
import styles from "./App.module.css";

// Top-level layout + route table.
export default function App() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          🎧 <span className={styles.brandMark}>Home</span>
        </Link>

        <nav className={styles.nav}>
          {user ? (
            <>
              <Link to="/profile" className={styles.link}>
                Profile
              </Link>
              <button className={styles.logout} onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.link}>
                Log in
              </Link>
              <Link to="/register" className={styles.link}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className={styles.main}>
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
