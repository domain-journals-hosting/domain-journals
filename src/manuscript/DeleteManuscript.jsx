import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
const DeleteManuscript = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("waiting");

  useEffect(() => {
    const confirmAndDelete = async () => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this manuscript?"
      );
      if (!confirmed) {
        navigate(-1);
        return;
      }

      try {
        await axios.delete(`/manuscript/${id}`);
        setStatus("deleted");
        setTimeout(() => navigate("/"), 2000);
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    confirmAndDelete();
  }, [id, navigate]);

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
