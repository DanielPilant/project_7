import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import styles from "./Auth.module.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    website: "",
    role: "customer", // customer or creator; admin is granted by an admin
  });
  const [status, setStatus] = useState("idle"); // idle | done | error
  const [error, setError] = useState("");

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      setStatus("done");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <section className={styles.wrap}>
        <h1>You&apos;re in! 🎉</h1>
        <p className="msg--success">Account created! Redirecting to login…</p>
      </section>
    );
  }

  return (
    <section className={styles.wrap}>
      <h1>Create your account</h1>
      <form className={styles.card} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Name *</span>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Username *</span>
          <input
            required
            type="text"
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Email *</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Password *</span>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Phone</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Website</span>
          <input
            type="url"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Account type</span>
          <select
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
          >
            <option value="customer">Customer (buy sound packs)</option>
            <option value="creator">Creator (upload sound packs)</option>
          </select>
        </label>

        <button type="submit" className={`btn ${styles.submit}`}>
          Create account
        </button>
        {status === "error" && <p className="msg--error">{error}</p>}

        <p className={styles.alt}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}
