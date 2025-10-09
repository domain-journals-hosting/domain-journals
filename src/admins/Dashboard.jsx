import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import { FaCamera, FaPencilAlt } from "react-icons/fa";
import { act, useState } from "react";
import axios from "../api/axios";
import useScreenSize from "../hooks/useScreenSize";
import Toast from "../components/Toast";
import RequireUserAuth from "./RequireUserAuth";

const Dashboard = () => {
  const { user, setUser, sendResetMail, logout } = useUser();
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name || "");
  const isMobile = useScreenSize(600);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const handleNameUpdate = async () => {
    if (!newName.trim())
      return setToast({ message: "Name cannot be empty", error: true });

    try {
      await axios.patch(
        "/admin/",
        { name: newName },
        { withCredentials: true }
      );
      setUser({ ...user, name: newName });
      setToast({ message: "Successfully updated name." });

      setEditingName(false);
    } catch (err) {
      console.error("Name update failed", err);
      setToast({ message: "Failed to update name.", error: true });
    }
  };

  const resetPassword = async () => {
    await sendResetMail();
    navigate("/admin/reset");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const uploadRes = await axios.post("/file/adminAvatar", formData, {});
      const avatarUrl = uploadRes.data.url;

      await axios.patch("/admin/avatar", { userId: user._id, avatarUrl });
      setUser({ ...user, profilePicture: avatarUrl });
    } catch (err) {
      console.error("Avatar update failed", err);
      setToast({ message: "Avatar update failed.", error: true });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("admin/logout", {}, { withCredentials: true });
      logout();
      navigate("/login");
    } catch (err) {
      setToast({ message: "Logout failed.", error: true });
      console.error("Logout failed", err);
    }
  };

  return (
    <div style={styles.container}>
      {toast && (
        <Toast
          message={toast.message}
          error={toast.error}
          onClose={() => setToast(null)}
        />
      )}

      <h1 style={styles.heading}>Dashboard</h1>

      <div style={styles.nameRow}>
        {!editingName ? (
          <>
            <p style={styles.welcome}>
              Welcome,<strong> {user.name}</strong>
            </p>
            <FaPencilAlt
              size={16}
              title="Edit name"
              style={styles.pencil}
              onClick={() => setEditingName(true)}
            />
          </>
        ) : (
          <div style={styles.editRow}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={styles.nameInput}
              placeholder="Enter full name"
            />
            <button onClick={handleNameUpdate} style={styles.saveButton}>
              Save
            </button>
          </div>
        )}
      </div>

      <div style={styles.avatarWrapper}>
        <img
          src={user.profilePicture || defaultAvatar}
          alt="Avatar"
          width={100}
          height={100}
          style={styles.avatar}
        />
        <label htmlFor="avatar-upload" style={styles.cameraLabel}>
          <FaCamera size={18} />
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </div>

      {uploading && <p style={styles.uploading}>Uploading...</p>}

      <h2 style={styles.subheading}>Actions</h2>

      <div
        style={{
          ...styles.actionList,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {[
          { to: "/admin/invite", text: "Invite Member", access: "admin" },
          { to: "/admin/review", text: "Review Manuscripts" },
          { to: "/admin/issue", text: "Send a New Issue", access: "admin" },
          { to: "/admin/all", text: "See All Users" },
          { to: "/admin/message", text: "See all messages" },
          {
            to: "/admin/newsletter",
            text: "Send a newsletter",
            access: "admin",
          },
          { to: "/admin/audit", text: "Audit reviews", access: "admin" },
          { to: "/admin/courses", text: "Add a course", access: "admin" },
          {
            to: "/admin/payments",
            text: "Check course payments",
            access: "admin",
          },
          { to: "/check-results", text: "Check results", access: "admin" },
        ].map(({ to, text, access }) => (
          <RequireUserAuth key={to} allowedRoles={access ? access : undefined}>
            <Link
              to={to}
              style={styles.link}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#e0f2f1";
                e.target.style.borderColor = "#1e9965";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#f1f8e9";
                e.target.style.borderColor = "#659377";
              }}
            >
              {text}
            </Link>
          </RequireUserAuth>
        ))}
      </div>

      <button onClick={handleLogout} style={styles.logoutButton}>
        Logout
      </button>
      <button onClick={resetPassword} style={styles.resetButton}>
        Reset password
      </button>
    </div>
  );
};

export default Dashboard;

const styles = {
  container: {
    padding: "20px",
    paddingTop: "70px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    width: "100%",
    margin: "0 auto",
    fontFamily: "sans-serif",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  heading: {
    textAlign: "center",
    fontSize: "28px",
    marginBottom: "10px",
  },
  welcome: {
    textAlign: "center",
    fontSize: "16px",
    marginBottom: "20px",
  },
  avatarWrapper: {
    position: "relative",
    width: "100px",
    margin: "0 auto 20px",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  cameraLabel: {
    position: "absolute",
    bottom: "0",
    right: "0",
    background: "#fff",
    borderRadius: "50%",
    padding: "5px",
    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  uploading: {
    textAlign: "center",
    color: "#888",
    marginBottom: "10px",
  },
  subheading: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  actionList: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
    maxWidth: "800px",
  },

  link: {
    flex: "1 1 calc(25% - 10px)",
    minWidth: "120px",
    maxWidth: "180px",
    boxSizing: "border-box",
    padding: "6px 12px",
    background: "#f1f8e9",
    color: "#093238",
    textDecoration: "none",
    borderRadius: "6px",
    border: "1px solid #659377",
    fontSize: "0.95rem",
    fontWeight: 500,
    textAlign: "center",
    transition: "all 0.2s ease",
  },

  logoutButton: {
    background: "crimson",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "block",
    margin: "20px auto",
    fontSize: "16px",
  },
  resetButton: {
    background: "#007bff",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "block",
    margin: "20px auto 0",
    fontSize: "16px",
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  pencil: {
    cursor: "pointer",
    color: "#555",
  },
  editRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  nameInput: {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: "1rem",
    minWidth: 200,
  },
  saveButton: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
};
