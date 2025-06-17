import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import { FaCamera } from "react-icons/fa";
import { useState } from "react";
import axios from "../api/axios";

const Dashboard = () => {
  const { user, setUser } = useUser();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const uploadRes = await axios.post("/file/adminAvatar", formData, {
        withCredentials: true,
      });

      const avatarUrl = uploadRes.data.url;

      await axios.patch(
        "/admin/avatar",
        { userId: user._id, avatarUrl },
        { withCredentials: true }
      );

      setUser({ ...user, profilePicture: avatarUrl });
    } catch (err) {
      console.error("Avatar update failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}</p>
      <div style={{ position: "relative", display: "inline-block" }}>
        <img
          src={user.profilePicture || defaultAvatar}
          alt="Avatar"
          width={100}
          height={100}
          style={{ borderRadius: "50%" }}
        />
        <label
          htmlFor="avatar-upload"
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            cursor: "pointer",
          }}
        >
          <FaCamera />
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

      {uploading && <p>Uploading...</p>}
      <h1>Actions</h1>
      <ul>
        <li>
          <Link to="/admin/invite">Invite Member</Link>
        </li>
        <li>
          <Link to="/admin/review">Review Manucsripts</Link>
        </li>
      </ul>
    </div>
  );
};

export default Dashboard;
