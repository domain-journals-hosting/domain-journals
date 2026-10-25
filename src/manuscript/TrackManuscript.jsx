import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { reverseSlug } from "../utils/slug";
import ManuscriptStatusTracker from "./Tracker";

const TrackStatus = () => {
  const { id } = useParams();
  const [manuscript, setManuscript] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getManuscriptStatus = async () => {
      try {
        const response = await axios.get(`manuscript/${id}`);
        setManuscript(response?.data || null);
      } catch (error) {
        console.error("Error fetching status:", error);
      } finally {
        setLoading(false);
      }
    };
    getManuscriptStatus();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading submission tracking status...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px 16px" }}>
      {manuscript && (
        <div style={{ marginBottom: "16px" }}>
          <h2
            style={{
              color: "var(--color-teal-dark, #093238)",
              margin: "0 0 6px 0",
            }}
          >
            {manuscript.title}
          </h2>
          <p style={{ color: "var(--color-text-muted, #3a5c43)", margin: 0 }}>
            Journal: <strong>{reverseSlug(manuscript.journal)}</strong> •
            Author: {manuscript.author}
          </p>
        </div>
      )}

      <ManuscriptStatusTracker
        currentStatus={manuscript?.status || "screening"}
        comment={manuscript?.comment}
      />
    </div>
  );
};

export default TrackStatus;
