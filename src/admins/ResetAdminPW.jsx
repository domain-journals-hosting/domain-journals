import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useUser } from "../hooks/useUser";
import "../styles/auth.css";

const ResetAdminPW = () => {
  const { user, logout } = useUser();
  const id = user?._id;
  const navigate = useNavigate();

  const [step, setStep] = useState("verify");
  const [resetKey, setResetKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) navigate(-1);
  }, [id, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/admin/verify", { id, resetKey });
      setMessage(res.data.message);
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        "/admin/resetPw",
        { userId: id, resetKey, newPassword },
        { withCredentials: true },
      );
      logout();
      console.log("DONE");
      navigate("/admin/login");
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">
          {step === "verify"
            ? "Enter the 6-digit code sent to your email."
            : "Choose a new password for your account."}
        </p>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="auth-error">{error}</p>}

        {step === "verify" ? (
          <form onSubmit={handleVerify} className="auth-form">
            <div className="auth-field">
              <label htmlFor="resetKey">Reset code</label>
              <input
                id="resetKey"
                type="text"
                placeholder="6-digit code"
                value={resetKey}
                onChange={(e) => setResetKey(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="auth-field">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}

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

export default ResetAdminPW;
