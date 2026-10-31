import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRegClock,
  FaCheckCircle,
  FaSpinner,
  FaExclamationCircle,
  FaArrowLeft,
} from "react-icons/fa";
import ConfirmDialog from "./ConfirmDialog";
import "../styles/examHeader.css";

const formatTime = (ms) => {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const ExamHeader = ({
  title = "Exam",
  timeLeft,
  onSubmit,
  saveStatus,
  answeredCount = 0,
  totalQuestions = 0,
}) => {
  const navigate = useNavigate();
  const [confirmType, setConfirmType] = useState(null); // 'submit' | 'exit' | null

  const handleConfirmAction = () => {
    if (confirmType === "submit") {
      onSubmit();
    } else if (confirmType === "exit") {
      navigate("/author");
    }
    setConfirmType(null);
  };

  return (
    <>
      <header className="exam-header">
        <div className="exam-header-left">
          <button
            type="button"
            className="exit-exam-btn"
            onClick={() => setConfirmType("exit")}
            title="Exit to Profile"
          >
            <FaArrowLeft /> Exit to Profile
          </button>
          <h2 className="exam-header-title">{title}</h2>
        </div>

        <div className="exam-controls">
          <div className={`timer ${timeLeft <= 60000 ? "warning" : ""}`}>
            <div className="timer-label">
              <FaRegClock /> Time left
            </div>
            <span className="time">{formatTime(timeLeft)}</span>
          </div>

          <div className="save-status">
            {saveStatus === "saving" && (
              <span className="saving">
                <FaSpinner className="spin-icon" /> Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="saved">
                <FaCheckCircle /> Saved {answeredCount}/{totalQuestions}
              </span>
            )}
            {saveStatus === "error" && (
              <span className="error">
                <FaExclamationCircle /> Save failed
              </span>
            )}
          </div>

          <button
            className="submit-btn"
            onClick={() => setConfirmType("submit")}
            disabled={timeLeft <= 0}
          >
            Submit Exam
          </button>
        </div>
      </header>

      <ConfirmDialog
        open={Boolean(confirmType)}
        onClose={() => setConfirmType(null)}
        onConfirm={handleConfirmAction}
        title={
          confirmType === "submit"
            ? "Submit Examination?"
            : "Exit Examination?"
        }
        message={
          confirmType === "submit"
            ? "Are you sure you want to submit your exam now? You won't be able to change answers after submitting."
            : "Leave exam session? Your current answers are automatically saved as a draft."
        }
      />
    </>
  );
};

export default ExamHeader;