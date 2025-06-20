import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
      setMessage("Reset link sent! Redirecting...");
      setTimeout(() => {
        navigate("/admin/reset");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to send reset email. Try again."
      );
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Reset Password</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          disabled={loading}
          required
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

export default ResetPasswordRequest;

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
    width: "100%",
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
  error: {
    color: "crimson",
    marginTop: 10,
  },
  message: {
    color: "green",
    marginTop: 10,
  },
};
