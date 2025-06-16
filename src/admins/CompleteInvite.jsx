import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../api/axios";

const CompleteInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    if (!name || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.patch(`/admin/complete/${token}`, { name, password });

      navigate("/admin/login");
    } catch (err) {
      console.error("Invite error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to complete setup. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Set Up Your Account</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="password"
        placeholder="Choose a Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleComplete} disabled={loading}>
        {loading ? "Setting up..." : "Complete Setup"}
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
};

export default CompleteInvite;
