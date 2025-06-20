import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useUser } from "../hooks/useUser";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser, login } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        "/admin/login",
        { email, password },
        { withCredentials: true }
      );
      console.log(res);
      login(res.data.user);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
        autoComplete="username"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
        autoComplete="current-password"
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p>
        <Link to="/admin/forgot">Fogotten pasword?</Link>{" "}
      </p>

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

export default AdminLogin;

const styles = {
  container: {
    maxWidth: 400,
    margin: "50px auto",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  heading: {
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    marginBottom: 15,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.3s",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    transition: "background-color 0.3s",
  },
  error: {
    color: "crimson",
    marginTop: 10,
    textAlign: "center",
  },
};
