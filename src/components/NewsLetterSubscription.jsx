import { useState } from "react";
import axios from "../api/axios";
import "../styles/newsletter.css";

const NewsletterSubscription = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Subscribing...");
    setIsError(false);
    try {
      await axios.post("/newsletter/subscribe", { email });
      setMsg("Subscribed successfully!");
      setEmail("");
    } catch (err) {
      setIsError(true);
      setMsg(
        err.response?.status === 409
          ? "You're already subscribed."
          : err?.response?.data?.error || "Subscription failed.",
      );
    }
  };

  return (
    <section className="newsletter">
      <h2 className="newsletter__title">Join our newsletter</h2>
      <p className="newsletter__sub">
        Stay updated with the latest research and publications.
      </p>
      <form onSubmit={handleSubmit} className="newsletter__form">
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="newsletter__input"
        />
        <button type="submit" className="newsletter__btn">
          Subscribe
        </button>
      </form>
      {msg && (
        <p
          className={`newsletter__msg${isError ? " newsletter__msg--error" : ""}`}
        >
          {msg}
        </p>
      )}
    </section>
  );
};

export default NewsletterSubscription;
