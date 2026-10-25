import "../styles/tracker.css";

const statusLabels = {
  screening: "Screening",
  "under-review": "Under Review",
  approved: "Approved",
  paid: "Paid",
  published: "Published",
};

const statusOrder = [
  "screening",
  "under-review",
  "approved",
  "paid",
  "published",
];

const ManuscriptStatusTracker = ({ currentStatus, comment }) => {
  const isRejected = currentStatus === "rejected";
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="tracker-container">
      <p className="tracker-disclaimer">
        These statuses reflect real-time editorial progress through to
        publication.
      </p>

      <div className="tracker-stepper">
        {statusOrder.map((status, index) => {
          const isActive = currentStatus === status;
          const isDone = !isRejected && currentIndex > index;

          let stepClass = "tracker-step-wrapper";
          if (isActive) stepClass += " is-active";
          if (isDone) stepClass += " is-done";

          return (
            <div key={status} className={stepClass}>
              <div className="tracker-circle">{isDone ? "✓" : index + 1}</div>
              <span className="tracker-label">{statusLabels[status]}</span>
            </div>
          );
        })}
      </div>

      {isRejected && (
        <div className="tracker-rejected-box">
          <div className="tracker-rejected-title">❌ Manuscript Rejected</div>
          {comment && <p className="tracker-rejected-comment">{comment}</p>}
        </div>
      )}
    </div>
  );
};

export default ManuscriptStatusTracker;
