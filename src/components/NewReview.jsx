import React, { useState } from "react";
import axios from "../api/axios";
import "../styles/newReview.css";

const NewReview = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await axios.post("/review", { text }, { withCredentials: true });
      setSuccess("Review submitted successfully.");
      setText("");
    } catch (err) {
      setSuccess("Something went wrong.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h2>Submit a Review</h2>
      <textarea
        placeholder="Write your review..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        disabled={loading}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </button>
      {success && <p className="status">{success}</p>}
    </form>
  );
};

export default NewReview;
