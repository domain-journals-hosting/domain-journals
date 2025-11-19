import { useState } from "react";
import axios from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/signup.css";

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
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  console.log(from);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "matricNumber"
          ? Number(e.target.value)
          : e.target.value,
    });
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
        {student && (
          <>
            {" "}
            <label>Department:</label>
            <select
              name="matricNumber"
              id="matricNumber"
              value={form.matricNumber}
              onChange={(e) => handleChange}
            >
              {[
                "anatomy",
                "pharmacy",
                "medical laboratory science",
                "nursing",
                "medical biochemistry",
                "physiology",
                "pharmacology",
                "medicine and surgery",
                "dentistry",
              ].map((d) => (
                <option value="d">
                  {d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <label>MatricNumber:</label>
            <input
              type="text"
              name="matricNumber"
              value={form.matricNumber}
              onChange={handleChange}
              required
            />
            <label htmlFor="level">Level</label>
            <select
              name="level"
              id="level"
              value={form.level}
              onChange={handleChange}
            >
              {[100, 200, 300, 400, 500, 600, 700, 800].map((l) => (
                <option value={l}>{l}</option>
              ))}
            </select>
          </>
        )}
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

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "left",
            marginRight: 90,
          }}
        >
          <input
            type="checkbox"
            value={student}
            name="student"
            id="student"
            onChange={(e) => setStudent((prev) => !prev)}
          />
          <label style={{ whiteSpace: "nowrap" }} htmlFor="student">
            I am a student of DELSU, Abraka
          </label>
        </div>
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
