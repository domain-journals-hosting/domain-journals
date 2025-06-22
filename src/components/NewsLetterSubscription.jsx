import { useState } from "react";
import axios from "../api/axios";

const NewsletterSubscription = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Subscribing...");

    try {
      const res = await axios.post("/newsletter/subscribe", { email });
      setMsg("Subscribed successfully!");
      setEmail("");
    } catch (err) {
      setMsg(
        err.response?.status === 409
          ? "You're already subscribed."
          : err?.response?.data?.error || "Subscription failed."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.section}>
      <h2 style={styles.heading}>Join our newsletter</h2>

      <div style={styles.box}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Join us
        </button>
      </div>

      {msg && (
        <p
          style={{
            ...styles.message,
            color:
              msg === "Subscription failed." ||
              msg === "A valid email is required."
                ? "crimson"
                : "#1b5e20",
          }}
        >
          {msg}
        </p>
      )}
    </form>
  );
};

export default NewsletterSubscription;
const styles = {
  heading: {
    fontSize: "1.5rem",
    color: "#093238",
    margin: "0 0 1rem",
    fontWeight: 700,
  },
  box: {
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    flexWrap: "wrap",
    maxWidth: "500px",
    borderRadius: "6px",
    overflow: "hidden",
  },
  input: {
    flex: "1 1 70%",
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    border: "none",
    outline: "none",
    backgroundColor: "#f9f9f9",
    fontWeight: 500,
    color: "#333",
  },
  button: {
    flex: "1 1 30%",
    backgroundColor: "#659377",
    color: "#f1f8e9",
    fontSize: "1rem",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  message: {
    fontSize: "0.95rem",
    fontWeight: 500,
    marginTop: "0.8rem",
  },
};
