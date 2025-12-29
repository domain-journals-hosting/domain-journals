import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";

function CompleteReset() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    if (password !== confirmPassword) {
      console.log({ password, confirmPassword });
      return setErr("Passwords must match");
    }
    try {
      const res = await axios.post("/author/completeReset", {
        token: decodeURIComponent(token),
        password,
      });
      console.log(res);
      window.alert(res.data.message);
      navigate("/login");
    } catch (err) {
      console.log(err);
      setErr(
        err?.response?.data?.error || err?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Complete Reset</h2>
      <input
        type="password"
        placeholder="Choose a Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        disabled={loading}
        style={{
          backgroundColor: "green",
        }}
      >
        Submit
      </button>
      {err && <p className="error">{err}</p>}
    </form>
  );
}

export default CompleteReset;
