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

const ExamHeader = ({ title = "Exam", timeLeft, onSubmit, saveStatus }) => {
  const handleSubmit = () => {
    const ok = window.confirm(
      "Are you sure you want to submit your exam now? You won't be able to change answers after submitting."
    );
    if (!ok) return;
    onSubmit();
  };

  return (
    <header className="exam-header">
      <div className="exam-title">
        <h2>{title}</h2>
      </div>

      <div className="exam-controls">
        <div className={`timer ${timeLeft <= 60000 ? "warning" : ""}`}>
          <span className="label">Time left</span>
          <span className="time">{formatTime(timeLeft)}</span>
        </div>

        <div className="save-status">
          {saveStatus === "saving" && (
            <span className="saving">Saving draft...</span>
          )}
          {saveStatus === "saved" && (
            <span className="saved">Draft saved ✓</span>
          )}
          {saveStatus === "error" && (
            <span className="error">Save failed ✗</span>
          )}
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={timeLeft <= 0}
          aria-disabled={timeLeft <= 0}
        >
          Submit
        </button>
      </div>
    </header>
  );
};

export default ExamHeader;
