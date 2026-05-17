import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../hooks/useAuthor";
import "../styles/auth.css";

const Login = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/author/login", formData, {
        withCredentials: true,
      });
      login(res.data.author);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your Domain Journals account</p>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-links">
          <button
            type="button"
            className="auth-link-btn"
            onClick={() => navigate("/forgot", { state: { from } })}
          >
            Forgotten password?
          </button>
          <span className="auth-links__sep">·</span>
          <button
            type="button"
            className="auth-link-btn"
            onClick={() => navigate("/signup", { state: { from } })}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
