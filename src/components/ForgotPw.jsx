import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuthor";

const ForgotPw = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const { sendResetMail, setUser } = useAuth();
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      setLoading(true);
      const response = await sendResetMail(email);
      setUser((prev) => ({ ...prev, _id: response.userId }));
      setSuccessMsg("Reset code sent. Redirecting...");
      setTimeout(() => navigate("/reset"), 1000);
    } catch (err) {
      console.error("Reset failed:", err);
      setSuccessMsg("Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <label htmlFor="email">Enter your email</label> <br />
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
      />
      <br />
      <button onClick={handleReset} disabled={loading || !email}>
        {loading ? "Sending..." : "Send Reset Code"}
      </button>
      {successMsg && <p>{successMsg}</p>}
    </div>
  );
};

export default ForgotPw;
