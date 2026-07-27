import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user", // admins are made by an existing admin, not chosen here
  });
  const [error, setError] = useState("");

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h1>Create account</h1>
      <form className="upload-card" onSubmit={handleSubmit}>
        <label className="field">
          Name
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </label>

        <label className="field">
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </label>

        <label className="field">
          Password
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </label>

        <label className="field">
          Account type
          <select value={form.role} onChange={(e) => update("role", e.target.value)}>
            <option value="user">User (buy sound packs)</option>
            <option value="creator">Creator (upload sound packs)</option>
          </select>
        </label>

        <button type="submit">Register</button>
        {error && <p className="msg--error">{error}</p>}

        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}
