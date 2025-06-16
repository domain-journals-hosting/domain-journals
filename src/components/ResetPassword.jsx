import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuthor";
import axios from "../api/axios";

const ResetPassword = () => {
  const { user, logout } = useAuth();
  const id = user?._id;
  const navigate = useNavigate();

  const [step, setStep] = useState("verify");
  const [resetKey, setResetKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) navigate(-1);
  }, [id, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/author/verify", {
        id,
        resetKey,
      });
      setMessage(res.data.message);
      setStep("reset");
    } catch (err) {
      console.log(err);
      setMessage(err.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      console.log({ id, resetKey, newPassword });

      setLoading(true);
      const res = await axios.post(
        "/author/resetPw",
        {
          userId: id,
          resetKey,
          newPassword,
        },
        { withCredentials: true }
      );
      setMessage(res.data.message);
      logout();
      navigate("/login");
    } catch (err) {
      console.log(err);
      setMessage(err.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      {message && <p>{message}</p>}

      {step === "verify" ? (
        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter 6-digit reset code"
            value={resetKey}
            onChange={(e) => setResetKey(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
