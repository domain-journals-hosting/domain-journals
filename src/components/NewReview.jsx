import React, { useState } from "react";
import axios from "../api/axios";
import "../styles/newReview.css";
import { useAuth } from "../hooks/useAuthor";

const NewReview = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || text.trim().length > 300) return;

    setLoading(true);
    try {
      await axios.post("/review", { text }, { withCredentials: true });
      setErr("");
      setSuccess("Review submitted successfully.");
      setText("");
    } catch (err) {
      setSuccess("");
      setErr(err?.response?.data?.error || "Something went wrong.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h2>Submit a Review</h2>
      <p>{300 - text.length} characters remaining</p>
      <i>Maximum of 300 characters</i>
      <textarea
        placeholder="Write your review..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        disabled={loading}
        required
        maxLength={300}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </button>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {success && <p className="status">{success}</p>}
    </form>
  );
};

export default NewReview;
