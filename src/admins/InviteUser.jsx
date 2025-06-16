import { useState } from "react";
import axios from "../api/axios";

const InviteUser = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  const handleInvite = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await axios.post(
        "/admin",
        { email, role },
        { withCredentials: true }
      );
      setMessage("Invite sent successfully!");
      setErr("");
    } catch (err) {
      console.error(err);
      setErr(err.response.data.error || "Failed to send invite.");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Invite a User</h2>
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="editor">Editor</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleInvite} disabled={loading}>
        {loading ? "Sending..." : "Send Invite"}
      </button>
      {message && <p>{message}</p>}
      {err && !message && <p style={{ color: "crimson" }}>{err}</p>}
    </div>
  );
};

export default InviteUser;
