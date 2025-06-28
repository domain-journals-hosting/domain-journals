import { useEffect, useState } from "react";
import journals, { slug } from "../data/journals";

const ChangeRole = ({ user, onClose, onSubmit }) => {
  const [role, setRole] = useState(user.role);
  const [access, setAccess] = useState(user.access || journals[0]);

  useEffect(() => {
    console.log(role, access);
  }, [role, access]);
  const handleSubmit = () => {
    const payload =
      role === "editor" ? { role, access: slug(access) } : { role };
    onSubmit(payload);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Change User Role</h3>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.select}
        >
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>

        {role === "editor" && (
          <>
            <label style={styles.label}>Journal Access</label>
            <select
              value={access}
              onChange={(e) => setAccess(e.target.value)}
              style={styles.select}
            >
              {journals.map((j) => (
                <option key={j} value={slug(j)}>
                  {j}
                </option>
              ))}
            </select>
          </>
        )}

        <button onClick={handleSubmit} style={styles.button}>
          Save
        </button>
        <button onClick={onClose} style={styles.cancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: 20,
    width: "100%",
    maxWidth: 500,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    display: "block",
  },
  select: {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  button: {
    width: "100%",
    padding: 10,
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 16,
    cursor: "pointer",
    marginBottom: 10,
  },
  cancel: {
    width: "100%",
    padding: 10,
    backgroundColor: "#eee",
    border: "none",
    borderRadius: 6,
    fontSize: 16,
    cursor: "pointer",
  },
};

export default ChangeRole;
