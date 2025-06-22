import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const AuditReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("unverified");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/review/audit");
      setReviews(res.data);
    } catch (err) {
      setError("Failed to load reviews.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAccept = async (id) => {
    try {
      await axios.patch(`/review/${id}`);
      showToast("success", "Review accepted.");
      // Update locally
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, verified: true } : r))
      );
    } catch (err) {
      showToast("error", "Failed to accept review.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await axios.delete(`/review/${id}`);
      showToast("success", "Review deleted.");
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      showToast("error", "Failed to delete review.");
      console.error(err);
    }
  };

  console.log(reviews);

  const filteredReviews = reviews.filter((r) =>
    filter === "verified" ? r.verified : !r.verified
  );

  // Inline styles
  const containerStyle = {
    maxWidth: 700,
    margin: "20px auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const tabsStyle = {
    marginBottom: 20,
  };

  const tabBtnBase = {
    padding: "10px 20px",
    marginRight: 10,
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: 600,
    transition: "background-color 0.3s ease",
  };

  const activeTabStyle = {
    backgroundColor: "#659377",
    color: "white",
  };

  const inactiveTabStyle = {
    backgroundColor: "#eee",
    color: "#333",
  };

  const reviewCardStyle = (verified) => ({
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: verified ? "#e6f2e6" : "#f9f9f9",
  });

  const btnStyle = {
    padding: "6px 12px",
    marginRight: 10,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontWeight: "bold",
  };

  const acceptBtnStyle = {
    ...btnStyle,
    backgroundColor: "#4caf50",
    color: "white",
  };

  const deleteBtnStyle = {
    ...btnStyle,
    backgroundColor: "#d9534f",
    color: "white",
  };

  return (
    <div style={containerStyle}>
      <h2>Audit Reviews</h2>

      {/* Tabs */}
      <div style={tabsStyle}>
        {["unverified", "verified"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              ...tabBtnBase,
              ...(filter === tab ? activeTabStyle : inactiveTabStyle),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                filter === tab ? "#527055" : "#ddd";
              e.currentTarget.style.color = filter === tab ? "white" : "#333";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                filter === tab ? "#659377" : "#eee";
              e.currentTarget.style.color = filter === tab ? "white" : "#333";
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <p>Loading reviews...</p>}

      {/* Error */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "10px 20px",
            borderRadius: 5,
            color: "white",
            backgroundColor: toast.type === "success" ? "#4caf50" : "#d9534f",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
        >
          {toast.msg}
        </div>
      )}

      {!loading && filteredReviews.length === 0 && (
        <p>No {filter} reviews to show.</p>
      )}

      {!loading &&
        filteredReviews.map((r) => (
          <div key={r._id} style={reviewCardStyle(r.verified)}>
            <div
              style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
            >
              {r.profilePicture && (
                <img
                  src={r.profilePicture}
                  alt={`${r.name}'s profile`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginRight: 10,
                    border: "1px solid #ccc",
                  }}
                />
              )}
              <div>
                <p style={{ margin: 0, fontWeight: "bold" }}>{r.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                  {new Date(r.dateTime).toLocaleString("en-US")}
                </p>
              </div>
            </div>
            <p>{r.text}</p>

            <div style={{ marginTop: 10 }}>
              {!r.verified && (
                <button
                  style={acceptBtnStyle}
                  onClick={() => handleAccept(r._id)}
                >
                  Accept
                </button>
              )}

              <button
                style={deleteBtnStyle}
                onClick={() => handleDelete(r._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default AuditReviews;
