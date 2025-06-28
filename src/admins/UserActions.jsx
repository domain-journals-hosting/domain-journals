import { FaTrash, FaUserShield } from "react-icons/fa";

const UserActions = ({ onClose, onDelete, onChangeAccess }) => {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <button style={styles.button} onClick={onDelete}>
          <FaTrash style={{ marginRight: 8 }} />
          Delete this user
        </button>
        <button style={styles.button} onClick={onChangeAccess}>
          <FaUserShield style={{ marginRight: 8 }} />
          Change user role
        </button>
        <button style={styles.cancel} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 1000,
  },
  sheet: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 600,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    boxShadow: "0 -2px 10px rgba(0,0,0,0.15)",
    animation: "slideUp 0.3s ease",
  },
  button: {
    width: "100%",
    padding: "12px",
    marginBottom: 10,
    fontSize: 16,
    textAlign: "left",
    border: "none",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  cancel: {
    width: "100%",
    padding: "12px",
    fontSize: 16,
    border: "none",
    backgroundColor: "#eee",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default UserActions;
