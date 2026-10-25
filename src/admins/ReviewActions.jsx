import { useRef, useState, useEffect } from "react";
import axios from "../api/axios";
import "../styles/review.css";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import RequireUserAuth from "./RequireUserAuth";
import EditAcceptedModal from "./EditAcceptedModal";
import ContentEditorModal from "../components/ContentEditorModal";
import slugify from "../utils/slug";

const ReviewActions = ({
  id,
  manuscript,
  status,
  issue,
  onUpdate,
  journal,
  edited,
}) => {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmChildren, setConfirmChildren] = useState(null);
  const [onConfirmAction, setOnConfirmAction] = useState(() => () => {});

  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [comment, setComment] = useState(
    "Sorry, We couldn't accept this manuscript",
  );
  const [loadingAction, setLoadingAction] = useState("");
  const [slug, setSlug] = useState("");
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [content, setContent] = useState("");

  // Keep slug updated with manuscript title by default
  useEffect(() => {
    if (manuscript?.title) {
      setSlug(slugify(manuscript.title));
    }
  }, [manuscript]);

  const confirm = (message, action, children = null) => {
    setConfirmMessage(message);
    setConfirmChildren(children);
    setOnConfirmAction(() => () => action());
    setConfirmVisible(true);
  };

  const handleFileUpload = async () => {
    if (!file)
      return setToast({
        message: "You need to pick a file first",
        error: true,
      });
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoadingAction("upload");

      const res = await axios.post("/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url;

      await axios.patch(`manuscript/admin/${id}`, { file: url });

      setToast({ message: "Successfully updated manuscript file" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUpdate();
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingAction("");
    }
  };

  const handleAction = async (type, customSlug = slug) => {
    setLoadingAction(type);

    const actionMap = {
      approve: { method: "patch", url: `/manuscript/${id}/approve` },
      pay: { method: "patch", url: `/manuscript/${id}/paid` },
      screen: { method: "patch", url: `manuscript/screen/${id}` },
      reject: {
        method: "patch",
        url: `/manuscript/${id}/reject`,
        data: { comment },
      },
      remind: { method: "patch", url: `/manuscript/${id}/remind` },
      revoke: { method: "patch", url: `/manuscript/${id}/revoke` },
      test: { method: "get", url: `/accepted/new/${journal}` },
      publish: {
        method: "post",
        url: `/accepted`,
        data: {
          id,
          issue,
          journal,
          slug: customSlug,
          ...(content ? { content } : {}),
        },
      },
      delete: { method: "delete", url: `/manuscript/admin/${id}` },
      deletePublished: { method: "delete", url: `/accepted/${id}` },
    };

    const action = actionMap[type];
    if (!action) return setToast({ message: "Invalid action.", error: true });

    try {
      const res = await axios[action.method](action.url, action.data || {}, {
        withCredentials: true,
      });
      setToast({ message: `Action '${type}' successful.` });
      onUpdate?.();
      setFile(null);
      if (type === "publish") setContent("");
      return res.data;
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.error || `Action '${type}' failed.`;
      setToast({ message, error: true });
    } finally {
      setLoadingAction("");
    }
  };

  const handleRejectSubmit = () => {
    if (!comment.trim())
      return setToast({
        message: "Please enter a rejection reason.",
        error: true,
      });
    handleAction("reject");
    setShowRejectInput(false);
    setComment("");
  };

  // Open Publish confirmation with slug input field
  const handlePublishClick = async () => {
    try {
      const generatedCustomId = await handleAction("test");
      let currentSlug = slug || slugify(manuscript.title);

      confirm(
        `Publishing manuscript. The ID "${generatedCustomId}" will be assigned. You can customize the URL slug below:`,
        () => handleAction("publish", currentSlug),
        <div style={{ marginTop: "12px", textAlign: "left" }}>
          <label
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "block",
              marginBottom: "4px",
            }}
          >
            URL Slug:
          </label>
          <input
            type="text"
            defaultValue={currentSlug}
            onChange={(e) => {
              currentSlug = e.target.value;
              setSlug(e.target.value);
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "0.9rem",
              boxSizing: "border-box",
            }}
          />
        </div>,
      );
    } catch (err) {
      setToast({
        message: "Failed to generate ID for publication.",
        error: true,
      });
    }
  };

  return (
    <div className="review-actions">
      <ConfirmDialog
        open={confirmVisible}
        onClose={() => {
          setConfirmVisible(false);
          setConfirmChildren(null);
        }}
        onConfirm={() => {
          onConfirmAction();
          setConfirmVisible(false);
          setConfirmChildren(null);
        }}
        message={confirmMessage}
      >
        {confirmChildren}
      </ConfirmDialog>

      {toast && (
        <Toast
          message={toast.message}
          error={toast.error}
          onClose={() => setToast(null)}
        />
      )}

      {/* EDIT MODAL FOR PUBLISHED MANUSCRIPTS */}
      {isEditModalOpen && (
        <EditAcceptedModal
          manuscript={manuscript}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setToast({ message: "Manuscript updated successfully." });
            onUpdate();
          }}
        />
      )}

      {isContentModalOpen && (
        <ContentEditorModal
          isOpen={isContentModalOpen}
          onClose={() => setIsContentModalOpen(false)}
          fileUrl={manuscript?.file}
          initialContent={content}
          onSave={setContent}
        />
      )}

      {status === "published" && (
        <>
          <button
            className="btn edit"
            style={{ backgroundColor: "#2196F3", color: "white" }}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Manuscript
          </button>

          <button
            className="btn delete"
            disabled={!!loadingAction}
            onClick={() =>
              confirm(
                "Are you sure you want to delete this published manuscript? This action cannot be undone.",
                () => handleAction("deletePublished"),
              )
            }
          >
            {loadingAction === "deletePublished" ? "Deleting..." : "Delete"}
          </button>
        </>
      )}

      {status === "screening" && (
        <>
          <button
            className="btn keep"
            onClick={() => handleAction("screen")}
            disabled={!!loadingAction}
          >
            {loadingAction === "screen" ? "Marking..." : "Mark as Under Review"}
          </button>

          <button
            className="btn delete"
            onClick={() => handleAction("delete")}
            disabled={!!loadingAction}
          >
            {loadingAction === "delete" ? "Deleting..." : "Delete"}
          </button>
        </>
      )}

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
          <RequireUserAuth allowedRoles={["admin"]}>
            <button
              className="btn pay"
              onClick={() =>
                confirm("Are you sure you've confirmed this payment?", () =>
                  handleAction("pay"),
                )
              }
            >
              {loadingAction === "pay" ? "Setting to Paid..." : "Set to Paid"}
            </button>
          </RequireUserAuth>
        </>
      )}

      {status === "paid" && (
        <div className="paid-group">
          <div className="upload-section">
            <label htmlFor={`upload-${id}`}>
              Upload edited file ({edited ? "Updated" : "Yet to update"})
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
              type="button"
              className="btn-sage-outline"
              onClick={() => setIsContentModalOpen(true)}
              disabled={!!loadingAction}
            >
              {content ? "Edit Article Content" : "Manage Article Content"}
            </button>
            {content && (
              <span style={{ fontSize: "0.8rem" }}>&#10003; Content added</span>
            )}
            <button
              className="btn publish"
              onClick={handlePublishClick}
              disabled={!!loadingAction}
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
