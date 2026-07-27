import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

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
      // Registration does not log you in — send to the login screen.
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <section>
        <h1>Create account</h1>
        <p className="msg--success">Account created! Redirecting to login…</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Create account</h1>
      <form className="upload-card" onSubmit={handleSubmit}>
        <label className="field">
          Name *
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </label>

        <label className="field">
          Username *
          <input
            required
            type="text"
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
          />
        </label>

        <label className="field">
          Email *
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </label>

        <label className="field">
          Password *
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </label>

        <label className="field">
          Phone
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </label>

        <label className="field">
          Website
          <input
            type="url"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
          />
        </label>

        <label className="field">
          Account type
          <select
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
          >
            <option value="customer">Customer (buy sound packs)</option>
            <option value="creator">Creator (upload sound packs)</option>
          </select>
        </label>

        <button type="submit">Register</button>
        {status === "error" && <p className="msg--error">{error}</p>}

        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}
