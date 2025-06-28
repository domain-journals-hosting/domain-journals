import { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import UserActions from "./UserActions";
import ConfirmDialog from "../components/ConfirmDialog";
import ChangeRole from "./ChangeRole";
import axios from "../api/axios";
import Toast from "../components/Toast";
import RequireUserAuth from "./RequireUserAuth";

const UserExcerpt = ({ user, setUsers }) => {
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRoleEditor, setShowRoleEditor] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const formattedDate = new Date(user.createdAt).toLocaleDateString();

  const handleDeleteStart = () => {
    setConfirmOpen(true);
    setMenuOpen(false);
  };
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/admin/${user._id}`);
      setToast({ message: "Successfully deleted user" });
      setTimeout(() => {
        setUsers((prev) => prev.filter((person) => person._id !== user._id));
      }, 3000);
    } catch (error) {
      console.error(error);
      setToast({
        message: error?.response?.data?.error || "Deleting failed",
        error: true,
      });
    }
  };

  const handleChangeRoleStart = () => {
    setMenuOpen(false);
    setShowRoleEditor(true);
  };

  const handleRoleChange = async (updated) => {
    try {
      const response = await axios.patch(`/admin/${user._id}`, updated);
      console.log(response);
      setToast({ message: "Successfully changed user role" });
      setTimeout(() => {
        setUsers((prev) => prev.map((person) => person._id !== user._id ? {...user, role: response.data.role, access: user.role === 'editor' ? response.data.access : null } : person));
      }, 3000);
    } catch (error) {
      console.error(error);
      setToast({
        message: error?.response?.data?.error || "Role change failed",
        error: true,
      });
    }
  };
  return (
    <div style={styles.container}>
      {showRoleEditor && (
        <ChangeRole
          user={user}
          onClose={() => setShowRoleEditor(null)}
          onSubmit={handleRoleChange}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          error={toast.error ? toast.error : false}
          onClose={() => setToast(null)}
        />
      )}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        message={`Are you sure you want to delete this user (${
          user.name ? user.name : "Pending user"
        })?`}
        onConfirm={handleDelete}
      />
      <img
        src={user.profilePicture || "/src/assets/defaultAvatar.jpg"}
        alt={`${user.name}'s avatar`}
        style={styles.avatar}
      />

      <div style={{ flex: 1 }}>
        <p style={styles.name}>
          {user.name ? user.name : `Pending user ${user.email}`}
        </p>
        <p style={styles.role}>
          Role: <strong>{user.role}</strong>
          {user.role === "editor" && user.access
            ? ` (Access: ${user.access})`
            : " (Domain Journals Admin)"}
        </p>
        <p style={styles.date}>Joined: {formattedDate}</p>
      </div>

      <RequireUserAuth allowedRoles={["admin"]}>
        <button
          onClick={() => setMenuOpen(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            color: "#555",
          }}
          title="User actions"
        >
          <FaEllipsisV />
        </button>
      </RequireUserAuth>

      {menuOpen && (
        <UserActions
          onClose={() => setMenuOpen(false)}
          onDelete={handleDeleteStart}
          onChangeAccess={handleChangeRoleStart}
        />
      )}
    </div>
  );
};

export default UserExcerpt;

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    objectFit: "cover",
    marginRight: 15,
  },
  name: {
    margin: 0,
    fontWeight: "600",
    fontSize: "1rem",
  },
  role: {
    margin: "4px 0",
    color: "#555",
  },
  date: {
    fontSize: "0.85rem",
    color: "#888",
  },
};
