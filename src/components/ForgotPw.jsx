import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuthor";

const ForgotPw = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const { sendResetMail, setUser } = useAuth();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
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

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (successMsg) setSuccessMsg("");
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleReset}>
        <label htmlFor="email">Enter your email</label>
        <br />
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
          disabled={loading}
          required
          style={{
            padding: 10,
            width: "100%",
            margin: "10px 0",
            fontSize: "1rem",
          }}
        />
        <button
          type="submit"
          disabled={loading || !email}
          style={{
            padding: "10px 20px",
            fontSize: "1rem",
            cursor: loading || !email ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending..." : "Send Reset Code"}
        </button>
      </form>
      {successMsg && <p style={{ marginTop: 15 }}>{successMsg}</p>}
    </div>
  );
};

export default ForgotPw;
