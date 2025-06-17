import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useParams } from "react-router-dom";
import "../styles/form.css";

const TrackStatus = () => {
  const { id } = useParams();
  const [status, setStatus] = useState("Under Review");

  useEffect(() => {
    axios
      .get(`/manuscript/${id}`)
      .then((res) => {
        setStatus(res.data.status || "Under Review");
      })
      .catch(() => {
        setStatus("Under Review");
      });
  }, [id]);

  return (
    <div className="form-wrapper">
      <h1>Track Manuscript Status</h1>
      <div style={{ marginTop: "20px", fontSize: "1.2rem" }}>
        <strong>Status:</strong> {status}
      </div>
    </div>
  );
};

export default TrackStatus;
