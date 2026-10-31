import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import DisplayResult from "./DisplayResult";
import { FaArrowLeft, FaRedo } from "react-icons/fa";
import "../styles/resultsPage.css";

const ExamResult = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await axios.get(`/result/${examId}`);
        setResult(response.data);
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load examination result.");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [examId]);

  if (loading) return <p className="loading">Loading result details...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!result) return <p>No result found for this examination.</p>;

  return (
    <div className="results-page-container">
      <div className="results-header-card">
        <div className="results-header-top">
          <h1 className="results-title">
            {result.exam?.description || "Examination Result"}
          </h1>
        </div>

        <DisplayResult result={result} />

        <div className="results-action-bar">
          <button
            className="results-action-btn secondary"
            onClick={() => navigate("/author")}
          >
            <FaArrowLeft /> Back to Profile
          </button>

          <button
            className="results-action-btn primary"
            onClick={() => navigate(`/revise-exam/${examId}`)}
          >
            <FaRedo /> Revise Questions
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResult;