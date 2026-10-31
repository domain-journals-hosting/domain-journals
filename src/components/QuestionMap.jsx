import React from "react";
import { FaFlag } from "react-icons/fa";
import "../styles/questionMap.css";

const QuestionMap = ({
  questions,
  answers,
  flagged,
  onJump,
  currentPage,
  questionsPerPage = 3,
}) => {
  const currentStart = currentPage * questionsPerPage;
  const currentEnd = currentStart + questionsPerPage;

  return (
    <aside className="question-map-card">
      <h3 className="map-title">Question Navigator</h3>
      <div className="question-map-grid">
        {questions.map((_, index) => {
          const answered =
            answers[index] !== null && answers[index] !== undefined;
          const isFlagged = flagged[index];
          const isVisibleOnPage = index >= currentStart && index < currentEnd;

          let statusClass = "unanswered";
          if (isFlagged) statusClass = "flagged";
          else if (answered) statusClass = "answered";

          return (
            <button
              key={index}
              type="button"
              className={`question-map-btn ${statusClass} ${
                isVisibleOnPage ? "active-page" : ""
              }`}
              onClick={() => onJump(index)}
              title={`Question ${index + 1}`}
            >
              {isFlagged ? <FaFlag className="map-flag-icon" /> : index + 1}
            </button>
          );
        })}
      </div>

      <div className="map-legend">
        <span className="legend-item">
          <span className="dot answered"></span> Answered
        </span>
        <span className="legend-item">
          <span className="dot flagged"></span> Flagged
        </span>
        <span className="legend-item">
          <span className="dot unanswered"></span> Unanswered
        </span>
      </div>
    </aside>
  );
};

export default QuestionMap;
