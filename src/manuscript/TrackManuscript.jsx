import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useParams } from "react-router-dom";
import "../styles/form.css";
import ManuscriptStatusTracker from "./Tracker";

const TrackStatus = () => {
  const { id } = useParams();
  const [status, setStatus] = useState("Under Review");

  useEffect(() => {
    const getManuscriptStatus = async () => {
      try {
        const response = await axios.get(`manuscript/${id}`);
        setStatus(response?.data?.status || "Under Review");
      } catch (error) {
        setStatus("Under Review");
      }
    };
    getManuscriptStatus();
  }, [id]);

  return <ManuscriptStatusTracker currentStatus={status} />;
};

export default TrackStatus;
