import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import "../styles/exam.css";
import {
  FaLock,
  FaPlay,
  FaClock,
  FaShieldAlt,
  FaInfoCircle,
  FaRedo,
  FaCheckCircle,
} from "react-icons/fa";

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
        setError(err?.response?.data?.error || "Something went wrong loading the exam details.");
      }
    };
    getExam();
  }, [examId]);

  if (error) {
    return (
      <div className="exam-container">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!exam) return <p className="loading">Loading examination details...</p>;

  return (
    <div className="exam-container">
      <div className="exam-rules-card">
        <div className="exam-rules-header">
          <h1 className="exam-rules-title">
            {exam.description || "Examination Instructions"}
          </h1>
          <p className="exam-rules-subtitle">
            Please read the instructions carefully before launching your exam attempt.
          </p>
        </div>

        <div className="exam-meta-grid">
          <div className="exam-meta-item">
            <FaClock className="exam-meta-icon" />
            <div className="exam-meta-info">
              <span className="exam-meta-label">Duration</span>
              <span className="exam-meta-value">{exam.duration} Minutes</span>
            </div>
          </div>

          <div className="exam-meta-item">
            <FaCheckCircle className="exam-meta-icon" />
            <div className="exam-meta-info">
              <span className="exam-meta-label">Auto-Save</span>
              <span className="exam-meta-value">Enabled Live</span>
            </div>
          </div>

          <div className="exam-meta-item">
            <FaShieldAlt className="exam-meta-icon" />
            <div className="exam-meta-info">
              <span className="exam-meta-label">Security</span>
              <span className="exam-meta-value">Proctored Session</span>
            </div>
          </div>
        </div>

        <ul className="exam-rules-list">
          <li className="exam-rule-item">
            <span className="exam-rule-number">1.</span>
            <p className="exam-rule-text">
              <strong>Timer Protocol:</strong> Once launched, the timer runs continuously and cannot be paused or reset. Ensure you are ready before clicking Start.
            </p>
          </li>
          <li className="exam-rule-item">
            <span className="exam-rule-number">2.</span>
            <p className="exam-rule-text">
              <strong>Live Draft Auto-Save:</strong> Your selected answers are automatically synchronized. If disconnected, re-opening the exam restores your saved draft.
            </p>
          </li>
          <li className="exam-rule-item">
            <span className="exam-rule-number">3.</span>
            <p className="exam-rule-text">
              <strong>Browser Integrity Guard:</strong> Switching tabs, minimizing windows, or leaving full-screen mode will log security warnings. Exceeding 3 warnings triggers automatic submission.
            </p>
          </li>
          <li className="exam-rule-item">
            <span className="exam-rule-number">4.</span>
            <p className="exam-rule-text">
              <strong>Independent Work:</strong> Screenshots, screen recordings, or accessing secondary devices during the exam session are strictly prohibited.
            </p>
          </li>
          <li className="exam-rule-item">
            <span className="exam-rule-number">5.</span>
            <p className="exam-rule-text">
              <strong>Final Submission:</strong> Once you click "Submit Exam" or the timer expires, your attempt is finalized and answers cannot be altered.
            </p>
          </li>
        </ul>

        <div className="exam-warning-box">
          <FaInfoCircle className="exam-warning-icon" />
          <span>
            Ensure you have a stable network connection and an uninterrupted environment before beginning.
          </span>
        </div>

        <div className="exam-actions">
          <button
            className="start-btn"
            onClick={() => setConfirmOpen(true)}
            disabled={loading || exam.locked}
          >
            {loading ? "Launching Exam..." : "Start Attempt"}{" "}
            {exam.locked ? <FaLock /> : <FaPlay />}
          </button>

          {exam.locked && (
            <button
              onClick={() => navigate("/revise-exam/" + examId)}
              className="revise-btn"
            >
              <FaRedo /> Revise Questions
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Start Examination Attempt?"
        message="Once started, the timer will begin immediately and cannot be paused. Are you ready to proceed?"
        onConfirm={() => navigate(`/take-exam/${examId}`)}
      />
    </div>
  );
};

export default Exam;