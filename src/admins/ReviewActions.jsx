import { useState } from "react";
import axios from "../api/axios";

const ReviewActions = ({ id, onUpdate }) => {
  console.log(id);

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [comment, setComment] = useState("");
  const [loadingAction, setLoadingAction] = useState("");

  const handleApprove = async () => {
    setLoadingAction("approve");
    try {
      const res = await axios.patch(
        `/manuscript/${id}/approve`,
        {},
        { withCredentials: true }
      );
      console.log(res);
      alert("Manuscript approved.");
      onUpdate?.();
    } catch (err) {
      console.error(err);
      alert("Approval failed.");
    } finally {
      setLoadingAction("");
    }
  };

  const handleRejectSubmit = async () => {
    if (!comment.trim()) return alert("Please enter a rejection reason.");
    setLoadingAction("reject");
    try {
      await axios.patch(
        `/manuscript/${id}/reject`,
        { comment },
        { withCredentials: true }
      );
      alert("Manuscript rejected.");
      setShowRejectInput(false);
      setComment("");
      onUpdate?.();
    } catch (err) {
      console.error(err);
      alert("Rejection failed.");
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <button
        onClick={handleApprove}
        disabled={loadingAction === "approve" || loadingAction === "reject"}
        style={{
          background: "green",
          color: "white",
          marginRight: "10px",
          opacity: loadingAction ? 0.6 : 1,
        }}
      >
        {loadingAction === "approve" ? "Approving..." : "Approve"}
      </button>

      {!showRejectInput ? (
        <button
          onClick={() => setShowRejectInput(true)}
          disabled={loadingAction !== ""}
          style={{
            background: "crimson",
            color: "white",
            opacity: loadingAction ? 0.6 : 1,
          }}
        >
          Reject
        </button>
      ) : (
        <div style={{ marginTop: "10px" }}>
          <input
            type="text"
            placeholder="Enter rejection reason"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loadingAction === "reject"}
            style={{ padding: "6px", marginRight: "8px", width: "60%" }}
          />
          <button
            onClick={handleRejectSubmit}
            disabled={loadingAction === "reject"}
            style={{
              background: "crimson",
              color: "white",
              marginRight: "5px",
              opacity: loadingAction === "reject" ? 0.6 : 1,
            }}
          >
            {loadingAction === "reject" ? "Rejecting..." : "Submit"}
          </button>
          <button
            onClick={() => {
              setShowRejectInput(false);
              setComment("");
            }}
            disabled={loadingAction === "reject"}
            style={{
              background: "#555",
              color: "white",
              opacity: loadingAction === "reject" ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewActions;
