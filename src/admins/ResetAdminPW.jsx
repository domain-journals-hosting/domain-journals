import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useUser } from "../hooks/useUser";

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
    try {
      setLoading(true);
      const res = await axios.post("/admin/verify", { id, resetKey });
      setMessage(res.data.message);
      setStep("reset");
    } catch (err) {
      setMessage("");
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
    try {
      setLoading(true);
      const res = await axios.post(
        "/admin/resetPw",
        { userId: id, resetKey, newPassword },
        { withCredentials: true }
      );
      setMessage(res.data.message);
      logout();
      navigate("/login");
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Reset Password</h2>
      {message && <p style={styles.message}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}

      {step === "verify" ? (
        <form onSubmit={handleVerify} style={styles.form}>
          <input
            type="text"
            placeholder="Enter 6-digit reset code"
            value={resetKey}
            onChange={(e) => setResetKey(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} style={styles.form}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetAdminPW;

const styles = {
  container: {
    maxWidth: 400,
    margin: "60px auto",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    textAlign: "center",
  },
  heading: {
    marginBottom: 20,
    fontSize: "1.8rem",
  },
  message: {
    marginBottom: 20,
    color: "green",
  },
  error: {
    marginBottom: 20,
    color: "crimson",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  input: {
    padding: 10,
    fontSize: "1rem",
    borderRadius: 6,
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px",
    fontSize: "1rem",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
