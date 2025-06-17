import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
const DeleteManuscript = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("waiting");
  const hasRun = useRef(false);
  useEffect(() => {
    const confirmAndDelete = async () => {
      if (hasRun?.current === true) return;
      const confirmed = window.confirm(
        "Are you sure you want to delete this manuscript?"
      );
      if (!confirmed) {
        navigate(-1);
        return;
      }
      hasRun.current = true;
      try {
        await axios.delete(`/manuscript/${token}`);
        setStatus("deleted");
        setTimeout(() => navigate("/"), 2000);
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    confirmAndDelete();
  }, [token, navigate]);

  return (
    <div>
      {status === "waiting" && <p>Preparing to delete...</p>}
      {status === "deleted" && <p>✅ Manuscript deleted. Redirecting...</p>}
      {status === "error" && (
        <p style={{ color: "red" }}>❌ Failed to delete manuscript.</p>
      )}
    </div>
  );
};

export default DeleteManuscript;
