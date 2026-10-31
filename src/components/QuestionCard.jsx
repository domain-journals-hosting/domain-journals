import React from "react";
import { FaFlag, FaRegFlag } from "react-icons/fa";
import "../styles/questionCard.css";

const QuestionCard = ({
  question,
  questionIndex,
  onAnswer,
  onFlag,
  flagged,
  selectedAnswer,
}) => {
  return (
    <div className="question-card">
      <div className="question-header">
        <span className="question-badge">Question {questionIndex + 1}</span>
        <button
          type="button"
          className={`flag-btn ${flagged ? "flagged" : ""}`}
          onClick={() => onFlag(questionIndex)}
        >
          {flagged ? <FaFlag /> : <FaRegFlag />}
          <span>{flagged ? "Flagged" : "Flag for Review"}</span>
        </button>
      </div>

      <p className="question-text">{question.text}</p>

      <div className="options-grid">
        {question.options.map((opt, i) => {
          const isSelected = selectedAnswer === i;
          return (
            <label
              key={i}
              className={`option-card ${isSelected ? "selected" : ""}`}
            >
              <input
                type="radio"
                name={`question-${questionIndex}`}
                value={i}
                checked={isSelected}
                onChange={() => onAnswer(questionIndex, i)}
              />
              <span className="option-index">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="option-text">{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
