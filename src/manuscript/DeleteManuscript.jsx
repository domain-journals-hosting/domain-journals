import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import ConfirmDialog from "../components/ConfirmDialog";

const DeleteManuscript = () => {
  const { id, token } = useParams();
  const targetId = id || token;
  const navigate = useNavigate();

  const [status, setStatus] = useState("waiting");
  const [open, setOpen] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    setOpen(true);
  }, []);

  const handleDelete = async () => {
    try {
      // Primary Attempt: Authenticated ID-based endpoint
      await axios.delete(`/manuscript/${targetId}`, { withCredentials: true });
      setStatus("deleted");
      setTimeout(() => navigate("/author"), 2000);
    } catch (primaryErr) {
      console.warn(
        "Primary ID delete failed. Falling back to legacy token endpoint...",
        primaryErr,
      );
      try {
        // Fallback Attempt: Legacy token-based endpoint
        await axios.delete(`/manuscript/token/${targetId}`);
        setStatus("deleted");
        setTimeout(() => navigate("/author"), 2000);
      } catch (legacyErr) {
        console.error("Delete failed on both endpoints:", legacyErr);
        setStatus("error");
      }
    }
  };

  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <ConfirmDialog
        open={open}
        onConfirm={handleDelete}
        onClose={() => {
          setOpen(false);
          navigate("/author");
        }}
        title="Delete Manuscript"
        message="Are you sure you want to delete this manuscript? This action cannot be undone."
      />

      {status === "waiting" && <p>Awaiting deletion confirmation...</p>}
      {status === "deleted" && (
        <p
          style={{ color: "var(--status-approved, #2e7d32)", fontWeight: 700 }}
        >
          ✅ Manuscript deleted successfully. Redirecting to dashboard...
        </p>
      )}
      {status === "error" && (
        <p
          style={{ color: "var(--status-rejected, #c62828)", fontWeight: 700 }}
        >
          ❌ Failed to delete manuscript. You may not be authorized, or the item
          no longer exists.
        </p>
      )}
    </div>
  );
};

export default DeleteManuscript;
