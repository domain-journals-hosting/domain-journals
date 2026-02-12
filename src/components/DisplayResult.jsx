const DisplayResult = ({ result }) => {
  const getOption = (index, options) => {
    return options?.[index] ?? "Not answered";
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.score}>
        Score: {result.score} / {result.totalScore} (
        {Math.round((result.score / result.totalScore) * 100)}%)
      </h2>

      {result.questions ? (
        <div>
          {result.questions.map((q, i) => {
            const isCorrect = q.answer === q.correctAnswer;

            return (
              <div key={q._id} style={styles.questionCard(isCorrect)}>
                <p style={styles.questionText}>
                  <strong>Q{i + 1}:</strong> {q.text}
                </p>

                <p>
                  Your answer: <span>{getOption(q.answer, q.options)}</span>
                </p>

                <p>
                  Correct answer:{" "}
                  <span>{getOption(q.correctAnswer, q.options)}</span>
                </p>

                <p style={styles.status(isCorrect)}>
                  {isCorrect ? "✔ Correct" : "✗ Incorrect"}
                </p>

                {q.explanation && (
                  <p style={styles.explanation}>Explanation: {q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <p>Review for this exam</p>
          <p>You can check here for a review later</p>
          <p>Review will show the questions, your and the correct answer</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginTop: 20,
  },
  score: {
    marginBottom: 20,
  },
  questionCard: (isCorrect) => ({
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: isCorrect ? "#4caf50" : "#f44336",
    backgroundColor: isCorrect ? "#e8f5e9" : "#fdecea",
  }),
  questionText: {
    fontWeight: "500",
    marginBottom: 8,
  },
  status: (isCorrect) => ({
    fontWeight: "bold",
    color: isCorrect ? "#2e7d32" : "#c62828",
  }),
  explanation: {
    marginTop: 8,
    fontStyle: "italic",
  },
};

export default DisplayResult;
