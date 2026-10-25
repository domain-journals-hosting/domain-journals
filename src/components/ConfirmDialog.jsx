import "../styles/confirmDialog.css";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  children,
}) => {
  if (!open) return null;

  return (
    <div className="confirm-backdrop">
      <div className="confirm-dialog">
        <h2>{title}</h2>
        {message && <p className="confirm-message">{message}</p>}

        {children && <div className="confirm-body">{children}</div>}

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
