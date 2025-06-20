import { useState } from "react";
import axios from "../api/axios";
import journals, { slug } from "../data/journals";

const InviteUser = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [access, setAccess] = useState("editor");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  const handleInvite = async () => {
    try {
      setErr("");
      const payload =
        role === "editor" ? { email, role, access } : { email, role };
      setLoading(true);
      const res = await axios.post("/admin", payload, {
        withCredentials: true,
      });
      setMessage("Invite sent successfully!");
      setErr("");
    } catch (err) {
      console.error(err);
      setErr(err.response?.data?.error || "Failed to send invite.");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Invite a User</h2>

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={styles.select}
      >
        <option value="editor">Editor</option>
        <option value="admin">Admin</option>
      </select>

      {role === "editor" && (
        <>
          <label htmlFor="access" style={styles.label}>
            Journal access:
          </label>
          <select
            value={access}
            id="access"
            onChange={(e) => setAccess(e.target.value)}
            style={styles.select}
          >
            {journals.map((journal) => (
              <option key={journal} value={slug(journal)}>
                {journal}
              </option>
            ))}
          </select>
        </>
      )}

      <button
        onClick={handleInvite}
        disabled={loading}
        style={{
          ...styles.button,
          backgroundColor: loading ? "#888" : "#007bff",
        }}
      >
        {loading ? "Sending..." : "Send Invite"}
      </button>

      {message && <p style={styles.success}>{message}</p>}
      {err && !message && <p style={styles.error}>{err}</p>}
    </div>
  );
};

export default InviteUser;

const styles = {
  container: {
    maxWidth: "500px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "sans-serif",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  heading: {
    fontSize: "24px",
    marginBottom: "20px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "10px",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
  success: {
    color: "green",
    marginTop: "15px",
    textAlign: "center",
  },
  error: {
    color: "crimson",
    marginTop: "15px",
    textAlign: "center",
  },
};
