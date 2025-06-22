import { useAuth } from "../hooks/useAuthor";
import axios from "../api/axios";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import { useEffect, useState } from "react";
import { FaCamera, FaPencilAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const AuthorProfile = () => {
  const { user, setUser, logout, sendResetMail } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [allManuscripts, setAllManuscripts] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name || "");
  const [acceptedManuscripts, setAcceptedManuscripts] = useState([]);
  const navigate = useNavigate();

  const handleNameUpdate = async () => {
    if (!newName.trim()) return alert("Name cannot be empty.");

    try {
      await axios.patch(
        "/author/",
        { name: newName },
        { withCredentials: true }
      );
      setUser({ ...user, name: newName });
      setEditingName(false);
    } catch (err) {
      console.error("Name update failed", err);
      alert("Failed to update name.");
    }
  };

  useEffect(() => {
    const getManuscripts = async () => {
      const response = await axios.get("manuscript/getByUser");
      setAllManuscripts(response.data);
    };
    const getAcceptedManuscripts = async () => {
      const response = await axios.get("/accepted");
      setAcceptedManuscripts(response.data);
    };
    getManuscripts();
    getAcceptedManuscripts();
  }, []);

  const handleLogout = async () => {
    await axios.post("author/logout", {}, { withCredentials: true });
    logout();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const { data } = await axios.post("/file/avatar", formData, {
        withCredentials: true,
      });
      const avatarUrl = data.url;

      await axios.patch(
        "/author/avatar",
        { authorId: user._id, avatarUrl },
        { withCredentials: true }
      );

      setUser({ ...user, profilePicture: avatarUrl });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    await sendResetMail();
    navigate("/reset");
  };

  return (
    <div style={styles.container}>
      <div style={styles.profileHeader}>
        <img
          src={user.profilePicture || defaultAvatar}
          alt="Profile"
          style={styles.avatar}
        />
        <label
          htmlFor="dp"
          style={styles.cameraLabel}
          title="Change profile picture"
        >
          <FaCamera size={20} style={{ color: "black" }} />
        </label>
        <input
          id="dp"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </div>

      <div style={styles.nameRow}>
        {!editingName ? (
          <>
            <h1 style={styles.name}>{user.name}</h1>
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
      {uploading && <p style={styles.uploadingText}>Uploading...</p>}

      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={handleLogout}>
          Logout
        </button>
        <button
          style={{ ...styles.button, marginLeft: 10 }}
          onClick={handleReset}
        >
          Reset Password
        </button>
      </div>
      <Link to="/review" style={{ fontWeight: 700 }}>
        Leave a review?
      </Link>
      {allManuscripts.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Your pending manuscripts</h2>
          {allManuscripts.map((manuscript) => (
            <p key={manuscript._id} style={styles.manuscriptItem}>
              {manuscript.title} - <em>{manuscript.status}</em>
            </p>
          ))}
        </section>
      )}

      {acceptedManuscripts.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Your published manuscripts</h2>
          {acceptedManuscripts.map((manuscript) => (
            <p key={manuscript._id} style={styles.manuscriptItem}>
              {manuscript.title}
            </p>
          ))}
        </section>
      )}
    </div>
  );
};

export default AuthorProfile;

const styles = {
  container: {
    maxWidth: 600,
    margin: "40px auto",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#fff",
    borderRadius: 10,
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  profileHeader: {
    position: "relative",
    display: "inline-block",
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    objectFit: "cover",
  },
  cameraLabel: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#007bff",
    borderRadius: "50%",
    padding: 8,
    color: "white",
    cursor: "pointer",
  },
  name: {
    margin: "10px 0 20px",
    fontWeight: "700",
    fontSize: "1.8rem",
  },
  uploadingText: {
    color: "#007bff",
    marginBottom: 20,
  },
  buttonGroup: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007bff",
    border: "none",
    padding: "10px 20px",
    color: "white",
    fontSize: "1rem",
    borderRadius: 6,
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  section: {
    textAlign: "left",
    marginBottom: 30,
  },
  sectionTitle: {
    borderBottom: "2px solid #007bff",
    paddingBottom: 6,
    marginBottom: 12,
    fontSize: "1.4rem",
  },
  manuscriptItem: {
    marginBottom: 6,
    fontSize: "1rem",
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
