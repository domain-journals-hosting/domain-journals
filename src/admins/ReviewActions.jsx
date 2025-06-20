import { useRef, useState } from "react";
import axios from "../api/axios";

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

      const manuscriptRes = await axios.patch(`manuscript/admin/${id}`, {
        file: url,
      });

      alert("Successfully updated manuscript file");
      fileInputRef.current.value = "";
      onUpdate();
    } catch (err) {
      console.log(err);
      return;
    } finally {
      setLoadingAction("");
    }
  };

  const handleAction = async (type, payload = {}) => {
    setLoadingAction(type);

    const actionMap = {
      approve: {
        method: "patch",
        url: `/manuscript/${id}/approve`,
      },
      pay: {
        method: "patch",
        url: `/manuscript/${id}/paid`,
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
      reupload: {
        method: "patch",
        url: `/manuscript/admin/${id}`,
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
    <div style={styles.container}>
      {status === "under-review" && (
        <>
          <button
            onClick={() => handleAction("approve")}
            disabled={!!loadingAction}
            style={{ ...styles.button, ...styles.approve }}
          >
            {loadingAction === "approve" ? "Approving..." : "Approve"}
          </button>

          {!showRejectInput ? (
            <button
              onClick={() => setShowRejectInput(true)}
              disabled={!!loadingAction}
              style={{ ...styles.button, ...styles.reject }}
            >
              Reject
            </button>
          ) : (
            <div style={styles.rejectInputContainer}>
              <input
                type="text"
                placeholder="Enter rejection reason"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!!loadingAction}
                style={styles.rejectInput}
              />
              <button
                onClick={handleRejectSubmit}
                disabled={!!loadingAction}
                style={{ ...styles.button, ...styles.reject, marginRight: 5 }}
              >
                {loadingAction === "reject" ? "Rejecting..." : "Submit"}
              </button>
              <button
                onClick={() => {
                  setShowRejectInput(false);
                  setComment("");
                }}
                disabled={!!loadingAction}
                style={{ ...styles.button, ...styles.cancel }}
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
            style={{ ...styles.button, ...styles.remind }}
          >
            {loadingAction === "remind"
              ? "Sending Reminder..."
              : "Send Reminder"}
          </button>
          <button
            onClick={() => handleAction("revoke")}
            disabled={!!loadingAction}
            style={{ ...styles.button, ...styles.revoke }}
          >
            {loadingAction === "revoke" ? "Revoking..." : "Revoke Approval"}
          </button>
          <button
            onClick={() => {
              const consent = window.confirm(
                "Are you sure you've confirmed this payment?"
              );
              if (!consent) return;
              handleAction("pay");
            }}
            disabled={!!loadingAction}
            style={{ ...styles.button, ...styles.revoke }}
          >
            {loadingAction === "pay"
              ? "Setting manuscript to paid..."
              : "Set to paid"}
          </button>
        </>
      )}

      {status === "paid" && (
        <>
          <label htmlFor="file" style={styles.label}>
            Upload edited file (Optional)
          </label>
          <input
            ref={fileInputRef}
            id="file"
            type="file"
            accept=".doc, .pdf"
            onChange={(e) => setFile(e.target.files[0])}
            style={styles.fileInput}
          />
          <button
            onClick={handleFileUpload}
            disabled={!!loadingAction}
            style={{ ...styles.button, ...styles.upload }}
          >
            {loadingAction === "upload" ? "Uploading..." : "Upload"}
          </button>
          <button
            onClick={() => handleAction("publish")}
            disabled={!!loadingAction}
            style={{ ...styles.button, ...styles.publish }}
          >
            {loadingAction === "publish" ? "Publishing..." : "Publish"}
          </button>
        </>
      )}

      {status === "rejected" && (
        <>
          <button
            onClick={() => handleAction("approve")}
            disabled={!!loadingAction}
            style={{ ...styles.button, ...styles.approve, marginRight: 10 }}
          >
            {loadingAction === "approve" ? "Re-approving..." : "Accept Again"}
          </button>
          <button
            onClick={() => handleAction("delete")}
            disabled={!!loadingAction}
            style={{ ...styles.button, ...styles.delete }}
          >
            {loadingAction === "delete" ? "Deleting..." : "Delete"}
          </button>
        </>
      )}
    </div>
  );
};

export default ReviewActions;

const styles = {
  container: {
    marginTop: 10,
  },
  button: {
    padding: "8px 14px",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: 14,
    transition: "background-color 0.2s ease",
  },
  approve: {
    backgroundColor: "green",
    color: "white",
  },
  reject: {
    backgroundColor: "crimson",
    color: "white",
  },
  cancel: {
    backgroundColor: "#555",
    color: "white",
  },
  remind: {
    backgroundColor: "#f0ad4e",
    color: "white",
    marginRight: 10,
  },
  revoke: {
    backgroundColor: "#6c757d",
    color: "white",
    marginRight: 10,
  },
  upload: {
    backgroundColor: "#007bff",
    color: "white",
    marginTop: 8,
    marginRight: 10,
  },
  publish: {
    backgroundColor: "#007bff",
    color: "white",
    marginTop: 8,
  },
  delete: {
    backgroundColor: "darkred",
    color: "white",
  },
  rejectInputContainer: {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
  },
  rejectInput: {
    padding: 6,
    marginRight: 8,
    width: "60%",
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  label: {
    display: "block",
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
  },
  fileInput: {
    marginBottom: 8,
  },
};
