import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import { FaCamera } from "react-icons/fa";
import { useState } from "react";
import axios from "../api/axios";

const Dashboard = () => {
  const { user, setUser, sendResetMail } = useUser();
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

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
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/logout", {}, { withCredentials: true });
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Dashboard</h1>
      <p style={styles.welcome}>
        Welcome, <strong>{user.name}</strong>
      </p>

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
      <ul style={styles.list}>
        <li>
          <Link to="/admin/invite" style={styles.link}>
            Invite Member
          </Link>
        </li>
        <li>
          <Link to="/admin/review" style={styles.link}>
            Review Manuscripts
          </Link>
        </li>
        <li>
          <Link to="/admin/issue" style={styles.link}>
            Send a New Issue
          </Link>
        </li>
        <li>
          <Link to="/admin/all" style={styles.link}>
            See All Users
          </Link>
        </li>
        <li>
          <Link to="/admin/message" style={styles.link}>
            See all messages
          </Link>
        </li>
      </ul>

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
    maxWidth: "600px",
    margin: "40px auto",
    padding: "20px",
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
  list: {
    listStyle: "none",
    paddingLeft: "0",
    marginBottom: "20px",
  },
  link: {
    display: "inline-block",
    marginBottom: "10px",
    padding: "8px 12px",
    background: "#007bff",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
  },
  logoutButton: {
    background: "crimson",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "block",
    margin: "0 auto",
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
};
