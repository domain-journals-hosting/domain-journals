import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "../styles/displayResult.css";

const DisplayResult = ({ result, isRevising = false }) => {
  const getOption = (index, options) => {
    return options?.[index] ?? "Not answered";
  };

  const percentage = Math.round((result.score / result.totalScore) * 100);

  return (
    <div className="display-result-card">
      {!isRevising && (
        <div className="score-banner">
          <h2 className="score-title">
            Overall Score: {result.score} / {result.totalScore} ({percentage}%)
          </h2>
          {result.isSample && (
            <span className="sample-badge">Practice Sample Attempt</span>
          )}
        </div>
      )}

      {result.questions ? (
        <div className="result-questions-list">
          {result.questions.map((q, i) => {
            const isCorrect = isRevising ? true : q.answer === q.correctAnswer;

            return (
              <div
                key={q._id || i}
                className={`result-question-card ${
                  isCorrect ? "correct" : "incorrect"
                }`}
              >
                <p className="result-question-text">
                  <strong>Q{i + 1}:</strong> {q.text}
                </p>

                {!isRevising && (
                  <p className="result-answer-row">
                    <strong>Your Answer:</strong>{" "}
                    <span className="result-answer-val">
                      {getOption(q.answer, q.options)}
                    </span>
                  </p>
                )}

                <p className="result-answer-row">
                  <strong>Correct Answer:</strong>{" "}
                  <span className="result-answer-val correct-text">
                    {getOption(q.correctAnswer, q.options)}
                  </span>
                </p>

                {!isRevising && (
                  <div
                    className={`result-status-pill ${
                      isCorrect ? "correct" : "incorrect"
                    }`}
                  >
                    {isCorrect ? <FaCheckCircle /> : <FaTimesCircle />}
                    <span>{isCorrect ? "Correct" : "Incorrect"}</span>
                  </div>
                )}

                {q.explanation && (
                  <div className="result-explanation-box">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="result-empty-box">
          <p>
            Review details for this examination are not currently available.
          </p>
        </div>
      )}
    </div>
  );
};

export default DisplayResult;