import React from "react";

const DisplayResult = ({ result }) => {
  const getOption = (index, options) => {
    return options[index];
  };
  return (
    <div className="result-page">
      <h2>
        Score: {result.score} / {result.totalScore} (
        {Math.round((result.score / result.totalScore) * 100)}%)
      </h2>

      {result.questions ? (
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
                {q.explanation && <p>Explanation: {q.explanation}</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <p>Review for this exam</p>
          <p>You can check here for a review later</p>
          <p>Review will show the questions, your and the correct answer </p>
        </div>
      )}
    </div>
  );
};

export default DisplayResult;
