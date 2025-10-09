import "../styles/questionMap.css";

const QuestionMap = ({ questions, answers, flagged, onJump }) => {
  console.log(answers);
  return (
    <div className="question-map">
      {questions.map((q, index) => {
        let statusClass = "unanswered";
        const answered =
          answers[index] !== null && answers[index] !== undefined;
        const isFlagged = flagged[index];
        if (isFlagged) statusClass = "flagged";
        else if (answered) statusClass = "answered";

        return (
          <button
            key={index}
            className={`question-btn ${statusClass}`}
            onClick={() => onJump(index)}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
};

export default QuestionMap;
