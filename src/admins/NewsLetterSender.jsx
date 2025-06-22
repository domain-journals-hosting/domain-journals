import { useState } from "react";
import axios from "../api/axios";

const NewsletterSender = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      await axios.post("/newsletter/send", { subject, body });
      setStatus("Newsletter sent successfully!");
      setSubject("");
      setBody("");
    } catch (err) {
      setStatus(err?.response?.data?.error || "Sending failed.");
    }
  };

  return (
    <form onSubmit={handleSend} className="newsletter-sender">
      <input
        type="text"
        placeholder="Newsletter Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />
      <textarea
        placeholder="Newsletter body (HTML supported)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={6}
      />
      <button type="submit">Send Newsletter</button>
      {status && <p>{status}</p>}
    </form>
  );
};

export default NewsletterSender;
