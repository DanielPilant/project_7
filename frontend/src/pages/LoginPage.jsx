import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import styles from "./Auth.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/"); // land on the home catalog
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  return (
    <section className={styles.wrap}>
      <h1>Welcome back 👋</h1>
      <form className={styles.card} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Username</span>
          <input
            required
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit" className={`btn ${styles.submit}`}>
          Log in
        </button>
        {error && <p className="msg--error">{error}</p>}

        <p className={styles.alt}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
}
