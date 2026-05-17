import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuthor";
import "../styles/auth.css";

const ForgotPw = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const { sendResetMail, setUser, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) setEmail(user.email);
  }, [user]);

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsError(false);
    try {
      setLoading(true);
      const response = await sendResetMail(email);
      setUser((prev) => ({ ...prev, _id: response.userId }));
      setMsg("Reset code sent. Redirecting...");
      setTimeout(() => navigate("/reset"), 1000);
    } catch (err) {
      setIsError(true);
      setMsg("Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Forgot password</h1>
        <p className="auth-subtitle">
          Enter your email and we'll send you a reset code.
        </p>

        {msg && (
          <p className={isError ? "auth-error" : "auth-success"}>{msg}</p>
        )}

        <form onSubmit={handleReset} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMsg("");
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
      </div>
    </div>
  );
};

export default ForgotPw;
