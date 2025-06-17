import { useState } from "react";
import axios from "../api/axios";

const ReviewActions = ({ id, status, issue, onUpdate, journal }) => {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [comment, setComment] = useState(
    "Sorry, We couldn't accept this manuscript"
  );
  const [loadingAction, setLoadingAction] = useState("");

  const handleAction = async (type, payload = {}) => {
    setLoadingAction(type);

    const actionMap = {
      approve: {
        method: "patch",
        url: `/manuscript/${id}/approve`,
      },
      reject: {
        method: "patch",
        url: `/manuscript/${id}/reject`,
        data: { comment },
      },
      remind: {
        method: "patch",
        url: `/manuscript/${id}/remind`,
      },
      revoke: {
        method: "patch",
        url: `/manuscript/${id}/revoke`,
      },
      publish: {
        method: "post",
        url: `/accepted`,
        data: { id, issue, journal },
      },
      delete: {
        method: "delete",
        url: `/manuscript/admin/${id}`,
      },
    };

    const action = actionMap[type];
    if (!action) return alert("Invalid action.");

    try {
      const res = await axios[action.method](action.url, action.data || {}, {
        withCredentials: true,
      });

      alert(`Action '${type}' successful.`);
      onUpdate?.();
    } catch (err) {
      console.error(err);
      alert(`Action '${type}' failed.`);
    } finally {
      setLoadingAction("");
    }
  };

  const handleRejectSubmit = () => {
    if (!comment.trim()) return alert("Please enter a rejection reason.");
    handleAction("reject");
    setShowRejectInput(false);
    setComment("");
  };

  return (
    <div style={{ marginTop: "10px" }}>
      {status === "under-review" && (
        <>
          <button
            onClick={() => handleAction("approve")}
            disabled={!!loadingAction}
            style={{ background: "green", color: "white", marginRight: "10px" }}
          >
            {loadingAction === "approve" ? "Approving..." : "Approve"}
          </button>

          {!showRejectInput ? (
            <button
              onClick={() => setShowRejectInput(true)}
              disabled={!!loadingAction}
              style={{ background: "crimson", color: "white" }}
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
                disabled={!!loadingAction}
                style={{ padding: "6px", marginRight: "8px", width: "60%" }}
              />
              <button
                onClick={handleRejectSubmit}
                disabled={!!loadingAction}
                style={{
                  background: "crimson",
                  color: "white",
                  marginRight: "5px",
                }}
              >
                {loadingAction === "reject" ? "Rejecting..." : "Submit"}
              </button>
              <button
                onClick={() => {
                  setShowRejectInput(false);
                  setComment("");
                }}
                disabled={!!loadingAction}
                style={{ background: "#555", color: "white" }}
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}

      {status === "approved" && (
        <>
          <button
            onClick={() => handleAction("remind")}
            disabled={!!loadingAction}
            style={{
              background: "#f0ad4e",
              color: "white",
              marginRight: "10px",
            }}
          >
            {loadingAction === "remind"
              ? "Sending Reminder..."
              : "Send Reminder"}
          </button>
          <button
            onClick={() => handleAction("revoke")}
            disabled={!!loadingAction}
            style={{ background: "#6c757d", color: "white" }}
          >
            {loadingAction === "revoke" ? "Revoking..." : "Revoke Approval"}
          </button>
        </>
      )}

      {status === "paid" && (
        <button
          onClick={() => handleAction("publish")}
          disabled={!!loadingAction}
          style={{ background: "#007bff", color: "white" }}
        >
          {loadingAction === "publish" ? "Publishing..." : "Publish"}
        </button>
      )}

      {status === "rejected" && (
        <>
          <button
            onClick={() => handleAction("approve")}
            disabled={!!loadingAction}
            style={{ background: "green", color: "white", marginRight: "10px" }}
          >
            {loadingAction === "approve" ? "Re-approving..." : "Accept Again"}
          </button>
          <button
            onClick={() => handleAction("delete")}
            disabled={!!loadingAction}
            style={{ background: "darkred", color: "white" }}
          >
            {loadingAction === "delete" ? "Deleting..." : "Delete"}
          </button>
        </>
      )}
    </div>
  );
};

export default ReviewActions;
