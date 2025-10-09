import React from "react";
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
        <h4>Question {questionIndex + 1}</h4>
        <button
          className={`flag-btn ${flagged ? "flagged" : ""}`}
          onClick={() => onFlag(questionIndex)}
        >
          {flagged ? "Unflag" : "Flag"}
        </button>
      </div>

      <p className="question-text">{question.text}</p>

      <div className="options">
        {question.options.map((opt, i) => (
          <label key={i} className="option-label">
            <input
              type="radio"
              name={`question-${questionIndex}`}
              value={i}
              checked={selectedAnswer === i}
              onChange={() => onAnswer(questionIndex, i)}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
