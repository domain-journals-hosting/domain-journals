import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import "../styles/auth.css";

const AdminForgotPW = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const { sendResetMail } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await sendResetMail(email);
      setMsg("Reset code sent. Redirecting...");
      setTimeout(() => navigate("/admin/reset"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Forgot password</h1>
        <p className="auth-subtitle">
          Enter your admin email to receive a reset code.
        </p>

        {error && <p className="auth-error">{error}</p>}
        {msg && <p className="auth-success">{msg}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={loading}
              required
            />
          </div>
          <button
            type="submit"
            className="auth-btn"
            disabled={loading || !email}
          >
            {loading ? "Sending..." : "Send reset code"}
          </button>
        </form>

        <div className="auth-links">
          <button
            className="auth-link-btn"
            onClick={() => navigate("/admin/login")}
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPW;
