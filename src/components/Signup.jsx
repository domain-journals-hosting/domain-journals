import { useState } from "react";
import axios from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/auth.css";

const departments = [
  "anatomy",
  "pharmacy",
  "medical laboratory science",
  "nursing",
  "medical biochemistry",
  "physiology",
  "pharmacology",
  "medicine and surgery",
  "dentistry",
];

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "anatomy",
    level: 100,
    matricNumber: "",
  });
  const [student, setStudent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await axios.post("/author/signup", form, {
        withCredentials: true,
      });
      if (res.status === 200) navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || "Something went wrong. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Join Domain Journals as an author</p>

        {errorMsg && <p className="auth-error">{errorMsg}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Choose a password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-checkbox">
            <input
              type="checkbox"
              id="student"
              checked={student}
              onChange={() => setStudent((p) => !p)}
            />
            <label htmlFor="student">I am a student of DELSU, Abraka</label>
          </div>

          {student && (
            <>
              <div className="auth-field">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="auth-field">
                <label htmlFor="matricNumber">Matric number</label>
                <input
                  type="text"
                  id="matricNumber"
                  name="matricNumber"
                  placeholder="e.g. 2019/12345"
                  value={form.matricNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="level">Level</label>
                <select
                  id="level"
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                >
                  {[100, 200, 300, 400, 500, 600, 700, 800].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-links">
          <span>Already have an account?</span>
          <button
            type="button"
            className="auth-link-btn"
            onClick={() => navigate("/login", { state: { from } })}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
