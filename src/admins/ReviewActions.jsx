import { useRef, useState } from "react";
import axios from "../api/axios";
import "../styles/review.css";

const ReviewActions = ({ id, status, issue, onUpdate, journal }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [comment, setComment] = useState(
    "Sorry, We couldn't accept this manuscript"
  );
  const [loadingAction, setLoadingAction] = useState("");

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoadingAction("upload");

      const res = await axios.post("/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url;

      await axios.patch(`manuscript/admin/${id}`, { file: url });

      alert("Successfully updated manuscript file");
      fileInputRef.current.value = "";
      onUpdate();
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingAction("");
    }
  };

  const handleAction = async (type, payload = {}) => {
    setLoadingAction(type);

    const actionMap = {
      approve: { method: "patch", url: `/manuscript/${id}/approve` },
      pay: { method: "patch", url: `/manuscript/${id}/paid` },
      reject: {
        method: "patch",
        url: `/manuscript/${id}/reject`,
        data: { comment },
      },
      remind: { method: "patch", url: `/manuscript/${id}/remind` },
      revoke: { method: "patch", url: `/manuscript/${id}/revoke` },
      publish: {
        method: "post",
        url: `/accepted`,
        data: { id, issue, journal },
      },
      delete: { method: "delete", url: `/manuscript/admin/${id}` },
    };

    const action = actionMap[type];
    if (!action) return alert("Invalid action.");

    try {
      await axios[action.method](action.url, action.data || {}, {
        withCredentials: true,
      });
      alert(`Action '${type}' successful.`);
      onUpdate?.();
      setFile(null);
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
    <div className="review-actions">
      {status === "under-review" && (
        <>
          <button
            className="btn approve"
            disabled={!!loadingAction}
            onClick={() => handleAction("approve")}
          >
            {loadingAction === "approve" ? "Approving..." : "Approve"}
          </button>

          {!showRejectInput ? (
            <button
              className="btn reject"
              onClick={() => setShowRejectInput(true)}
            >
              Reject
            </button>
          ) : (
            <div className="reject-box">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Rejection reason"
              />
              <button className="btn reject" onClick={handleRejectSubmit}>
                {loadingAction === "reject" ? "Submitting" : "Submit"}
              </button>
              <button
                className="btn cancel"
                onClick={() => setShowRejectInput(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}

      {status === "approved" && (
        <>
          <button className="btn remind" onClick={() => handleAction("remind")}>
            {loadingAction === "remind" ? "Sending..." : "Send Reminder"}
          </button>

          <button className="btn revoke" onClick={() => handleAction("revoke")}>
            {loadingAction === "revoke" ? "Revoking..." : "Revoke Approval"}
          </button>
          <button
            className="btn pay"
            onClick={() => {
              if (window.confirm("Are you sure you've confirmed this payment?"))
                handleAction("pay");
            }}
          >
            {loadingAction === "pay" ? "Setting to Paid..." : "Set to Paid"}
          </button>
        </>
      )}
      {status === "paid" && (
        <div className="paid-group">
          <div className="upload-section">
            <label htmlFor={`upload-${id}`}>
              Upload edited file (optional)
            </label>
            <input
              id={`upload-${id}`}
              ref={fileInputRef}
              type="file"
              accept=".doc,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button className="btn upload" onClick={handleFileUpload}>
              {loadingAction === "upload" ? "Uploading..." : "Upload"}
            </button>
          </div>

          <div className="publish-wrapper">
            <button
              className="btn publish"
              onClick={() => handleAction("publish")}
            >
              {loadingAction === "publish" ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      )}

      {status === "rejected" && (
        <>
          <button
            className="btn approve"
            onClick={() => handleAction("approve")}
          >
            {loadingAction === "approve" ? "Re-approving..." : "Accept Again"}
          </button>

          <button className="btn delete" onClick={() => handleAction("delete")}>
            {loadingAction === "delete" ? "Deleting..." : "Delete"}
          </button>
        </>
      )}
    </div>
  );
};

export default ReviewActions;
