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
    <form onSubmit={handleSubmit} className="newsletter-form">
      <h3>Subscribe to our newsletter</h3>
      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Subscribe</button>
      {msg && (
        <p
          style={{
            color: msg === "Subscription failed." ? "crimson" : "",
          }}
        >
          {msg}
        </p>
      )}
    </form>
  );
};

export default NewsletterSubscription;
