import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useParams } from "react-router-dom";
import "../styles/form.css";
import ManuscriptStatusTracker from "./Tracker";

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

  return <ManuscriptStatusTracker currentStatus={status} />;
};

export default TrackStatus;
