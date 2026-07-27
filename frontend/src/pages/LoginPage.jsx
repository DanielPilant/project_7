import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h1>Log in</h1>
      <form className="upload-card" onSubmit={handleSubmit}>
        <label className="field">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="field">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit">Log in</button>
        {error && <p className="msg--error">{error}</p>}

        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </section>
  );
}
