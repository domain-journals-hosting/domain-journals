const statusLabels = {
  "under-review": "Under Review",
  approved: "Approved (Awaiting Payment)",
  paid: "Paid",
};

const statusOrder = ["under-review", "approved", "paid"];

const ManuscriptStatusTracker = ({ currentStatus }) => {
  const isRejected = currentStatus === "rejected";

  return (
    <div style={{ padding: "1rem 0" }}>
      <p
        style={{
          marginBottom: "1rem",
          fontStyle: "italic",
          fontSize: "0.9rem",
        }}
      >
        These statuses are only valid until your manuscript has been uploaded
      </p>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        {statusOrder.map((status, index) => {
          const isActive = currentStatus === status;
          const isDone =
            statusOrder.indexOf(currentStatus) > index && !isRejected;

          return (
            <div key={status} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: isActive
                    ? "green"
                    : isDone
                    ? "#ccc"
                    : "#e0e0e0",
                  color: isActive ? "#fff" : "#333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  margin: "0 auto",
                }}
              >
                {index + 1}
              </div>
              <small
                style={{
                  display: "block",
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                }}
              >
                {statusLabels[status]}
              </small>
            </div>
          );
        })}

        {isRejected && (
          <div
            style={{ marginLeft: "2rem", color: "crimson", fontWeight: "bold" }}
          >
            ❌ Rejected
          </div>
        )}
      </div>
    </div>
  );
};

export default ManuscriptStatusTracker;
