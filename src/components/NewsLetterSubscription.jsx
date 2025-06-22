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
      <h2 style={styles.heading}>Join our news letter</h2>

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
            color: msg === "Subscription failed." ? "crimson" : "#1b5e20",
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
  section: {
    backgroundColor: "#f1f8e9",
    padding: "2rem",
    textAlign: "center",
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  heading: {
    fontSize: "1.8rem",
    color: "#093238",
    marginBottom: "1.5rem",
  },
  box: {
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    maxWidth: "500px",
    margin: "0 auto",
    borderRadius: "4px",
    overflow: "hidden",
    gap: "0", // no gap needed because widths are fixed
  },
  input: {
    width: "70%", // 70% width for input
    padding: "1rem",
    fontSize: "1rem",
    border: "none",
    outline: "none",
    backgroundColor: "#fff",
    fontWeight: "bold",
    color: "#555",
  },
  button: {
    width: "30%",
    backgroundColor: "#659377",
    color: "white",
    fontSize: "1rem",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    padding: "50px 30px ",
    transition: "background 0.3s ease",
  },
  message: {
    marginTop: "1rem",
    fontSize: "0.95rem",
  },
};
