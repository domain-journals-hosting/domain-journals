import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../hooks/useAuthor";

const Login = () => {
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
      navigate("/author");
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
      <Link to="/forgot">Forgotten password?</Link>
    </form>
  );
};

export default Login;
