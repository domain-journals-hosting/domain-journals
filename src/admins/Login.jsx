import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: 10, width: "100%" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: 10, width: "100%" }}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ width: "100%", padding: "0.5rem" }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
    </div>
  );
};

export default AdminLogin;
