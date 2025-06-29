import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import ConfirmDialog from "../components/ConfirmDialog";
const DeleteManuscript = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("waiting");
  const [open, setOpen] = useState(false);
  const hasRun = useRef(false);
  useEffect(() => {
    const confirmAndDelete = async () => {
      if (hasRun?.current === true) return;
      hasRun.current = true;
    };
    setOpen(true);
    confirmAndDelete();
  }, [token, navigate]);

  return (
    <div>
      <ConfirmDialog
        open={open}
        onConfirm={async () => {
          try {
            await axios.delete(`/manuscript/${token}`);
            setStatus("deleted");
            setTimeout(() => navigate("/"), 2000);
          } catch (err) {
            console.error(err);
            setStatus("error");
          }
        }}
        onClose={() => setOpen(false)}
        message="Are you sure you want to delete this manuscript"
      />
      {status === "waiting" && <p>Preparing to delete...</p>}
      {status === "deleted" && <p>✅ Manuscript deleted. Redirecting...</p>}
      {status === "error" && (
        <p style={{ color: "red" }}>❌ Failed to delete manuscript.</p>
      )}
    </div>
  );
};

export default DeleteManuscript;
