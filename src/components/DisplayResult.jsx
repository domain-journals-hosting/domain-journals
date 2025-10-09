import React from "react";

const DisplayResult = ({ result }) => {
  const getOption = (index, options) => {
    return options[index];
  };
  return (
    <div className="result-page">
      <h2>
        Score: {result.score} / {result.totalScore}
      </h2>

      <div className="question-list">
        {result?.questions?.map((q, i) => {
          const isCorrect = q.answer === q.correctAnswer;
          return (
            <div
              key={q._id}
              className={`result-question ${
                isCorrect ? "correct" : "incorrect"
              }`}
            >
              <p className="question-text">
                <strong>Q{i + 1}:</strong> {q.text}
              </p>
              <p>
                Your answer: <span>{getOption(q.answer, q.options)}</span>
              </p>
              <p>
                Correct answer:{" "}
                <span>{getOption(q.correctAnswer, q.options)} </span>
              </p>
              <p className="status">
                {isCorrect ? "✔ Correct" : "✗ Incorrect"}
              </p>
              {q.explantion && <p>Explanation: {q.explantion}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DisplayResult;
