import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../hooks/useAuthor";

const Login = () => {
  const location = useLocation();
  const from = location.state?.from.pathname || "/";
  console.log(from);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/author/login", formData, {
        withCredentials: true,
      });
      login(res.data.author);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.error || "Login failed";
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <button type="submit">Login</button>
      <p>
        Don’t have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/signup", { state: { from } })}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Create one
        </button>
      </p>

      <button
        type="button"
        onClick={() => navigate("/forgot", { state: { from } })}
        style={{
          background: "none",
          border: "none",
          color: "blue",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Forgotten password?
      </button>
    </form>
  );
};

export default Login;
