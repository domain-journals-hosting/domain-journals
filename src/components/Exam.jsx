import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import "../styles/exam.css";
import { FaLock } from "react-icons/fa";

const Exam = () => {
  const { examId } = useParams();
  const [error, setError] = useState("");
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const getExam = async () => {
      try {
        const response = await axios.get(`/exam/view/${examId}`);
        setExam(response.data);
      } catch (err) {
        setError(err?.response?.data?.error || "Something went wrong");
      }
    };
    getExam();
  }, [examId]);

  if (!exam) return <p className="loading">Loading...</p>;

  return (
    <div className="exam-container">
      {error && <p className="error">{error}</p>}

      {exam && (
        <div className="exam-rules">
          <h1>{exam.description || "Exam Instructions"}</h1>
          <ol>
            <li>Duration: {exam.duration} minutes</li>
            <li>Read all questions carefully before answering.</li>
            <li>Once you start, the timer cannot be paused or reset.</li>
            <li>Answers are final once submitted — you cannot change them.</li>
            <li>
              Ensure you have a stable internet connection during the exam.
            </li>
            <li>Do not take screenshots or record the exam content.</li>
            <li>
              Do not switch tabs, minimize, or leave this page during the exam.
            </li>
          </ol>

          <button
            className="start-btn"
            onClick={() => setConfirmOpen(true)}
            disabled={loading || exam.locked}
          >
            {loading ? "Starting your exam..." : "Start Attempt"} <FaLock />
          </button>

          {exam.locked && (
            <button
              onClick={() => navigate("/revise-exam/" + examId)}
              className="revise-btn"
            >
              {" "}
              Revise{" "}
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        message="Once you start this exam, the timer will begin immediately. Are you sure you want to proceed?"
        onConfirm={() => navigate(`/take-exam/${examId}`)}
      />
    </div>
  );
};

export default Exam;
