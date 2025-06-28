import "../styles/confirmDialog.css";

const ConfirmDialog = ({
  open,
  onClose = () => (open = false),
  onConfirm,
  message,
}) => {
  if (!open) return null;

  return (
    <div className="confirm-backdrop">
      <div className="confirm-dialog">
        <h2>Are you sure?</h2>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn confirm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
