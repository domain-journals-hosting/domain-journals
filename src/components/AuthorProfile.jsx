import { useAuth } from "../hooks/useAuthor";
import axios from "../api/axios";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import { useState } from "react";
import { FaCamera } from "react-icons/fa";
import { Navigate, useNavigate } from "react-router-dom";

const AuthorProfile = () => {
  const { user, setUser, logout, sendResetMail } = useAuth();
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await axios.post(
      "author/logout",
      {},
      { withCredentials: true }
    );
    console.log(res);
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

      const res = await axios.patch(
        "/author/avatar",
        {
          authorId: user._id,
          avatarUrl,
        },
        { withCredentials: true }
      );
      console.log(res);
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
    <div>
      <img
        src={user.profilePicture || defaultAvatar}
        alt="Profile"
        style={{ width: 120, height: 120, borderRadius: "50%" }}
      />
      <div>
        <label htmlFor="dp">
          <FaCamera />
        </label>
        <input
          id="dp"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: "none" }}
        />
        <h1>{user.name}</h1>
        {uploading && <p>Uploading...</p>}
      </div>
      <button onClick={handleLogout}> Logout</button> <br />
      <br />
      <button onClick={handleReset}> Reset Password</button>
    </div>
  );
};

export default AuthorProfile;
