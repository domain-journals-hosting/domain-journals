const statusLabels = {
  "under-review": "Under Review",
  approved: "Approved (Awaiting Payment)",
  paid: "Paid",
};

const statusOrder = ["under-review", "approved", "paid"];

const ManuscriptStatusTracker = ({ currentStatus }) => {
  const isRejected = currentStatus === "rejected";

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <p>
        These statuses are only valid until your manuscript has been uploaded
      </p>
      {statusOrder.map((status, index) => {
        const isActive = currentStatus === status;
        const isDone =
          statusOrder.indexOf(currentStatus) > index && !isRejected;

        return (
          <div
            key={status}
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",

              padding: "10px",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: isActive ? "green" : isDone ? "#ccc" : "#eee",
                color: isActive ? "#fff" : "#333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {index + 1}
            </div>
            <small style={{ fontSize: "0.8rem" }}>{statusLabels[status]}</small>
          </div>
        );
      })}

      {isRejected && (
        <div style={{ marginLeft: "20px", color: "crimson" }}>❌ Rejected</div>
      )}
    </div>
  );
};

export default ManuscriptStatusTracker;
