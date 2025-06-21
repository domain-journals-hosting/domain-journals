import { useState } from "react";
import axios from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/signup.css";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  console.log(from);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    setErrorMsg("");
    e.preventDefault();

    try {
      const res = await axios.post("/author/signup", form, {
        withCredentials: true,
      });
      if (res.status === 200) {
        navigate(from, { replace: true });
      } else {
        console.log(res);
      }
    } catch (err) {
      const message =
        err.response?.data?.error || "Something went wrong. Try again.";
      console.log(err.response);
      setErrorMsg(message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign up as an author</h2>
      {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Create Account</button>

        <p>
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login", { state: { from } })}
            style={{
              background: "none",
              border: "none",
              color: "blue",
              cursor: "pointer",
              padding: 0,
              font: "inherit",
            }}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default Signup;
