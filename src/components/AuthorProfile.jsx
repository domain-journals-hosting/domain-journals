import { useAuth } from "../hooks/useAuthor";
import axios from "../api/axios";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import { useEffect, useState } from "react";
import { FaCamera, FaPencilAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Toast from "./Toast";

const AuthorProfile = () => {
  const { user, setUser, logout, sendResetMail } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [allManuscripts, setAllManuscripts] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name || "");
  const [acceptedManuscripts, setAcceptedManuscripts] = useState([]);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getManuscripts = async () => {
      const res = await axios.get("/manuscript/getByUser");
      setAllManuscripts(res.data);
    };
    const getAccepted = async () => {
      const res = await axios.get("/accepted");
      console.log(res);
      setAcceptedManuscripts(res.data);
    };
    getManuscripts();
    getAccepted();
  }, []);

  const handleLogout = async () => {
    await axios.post("/author/logout", {}, { withCredentials: true });
    logout();
  };

  const handleReset = async () => {
    await sendResetMail();
    navigate("/reset");
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
      await axios.patch(
        "/author/avatar",
        { authorId: user._id, avatarUrl: data.url },
        { withCredentials: true }
      );
      setUser({ ...user, profilePicture: data.url });
    } catch (err) {
      setToast({ message: "Avatar uploading failed", error: true });
      console.error("Avatar upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!newName.trim()) return;
    try {
      await axios.patch(
        "/author/",
        { name: newName },
        { withCredentials: true }
      );
      setUser({ ...user, name: newName });
      setEditingName(false);
    } catch (err) {
      setToast({ message: "Failed to update name", error: true });
    }
  };

  console.log(acceptedManuscripts);

  return (
    <div
      style={{
        background: "#f1f8e9",
        minHeight: "100vh",
        padding: "2rem 1rem",
        paddingTop: "70px",
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          error={toast.error}
          onClose={() => setToast(null)}
        />
      )}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 16,
          padding: "2rem",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexDirection: "column",
          }}
        >
          <div style={{ position: "relative" }}>
            <img
              src={user.profilePicture || defaultAvatar}
              alt="avatar"
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <label
              htmlFor="avatar-upload"
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                background: "#659377",
                padding: 6,
                borderRadius: "50%",
                cursor: "pointer",
              }}
            >
              <FaCamera size={14} color="#fff" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
          <div>
            {!editingName ? (
              <h2 style={{ fontSize: "1.3rem", color: "#093238" }}>
                {user.name}
                <FaPencilAlt
                  size={14}
                  color="#659377"
                  style={{ cursor: "pointer" }}
                  onClick={() => setEditingName(true)}
                />
              </h2>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                  }}
                />
                <button
                  onClick={handleNameUpdate}
                  style={{
                    background: "#659377",
                    color: "#fff",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: 6,
                  }}
                >
                  Save
                </button>
              </div>
            )}
            <p style={{ color: uploading ? "#c62828" : "#4caf50" }}>
              {uploading ? "Uploading avatar..." : null}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            onClick={handleLogout}
            style={{
              background: "#1e9965",
              color: "#fff",
              padding: "0.5rem 1.2rem",
              border: "none",
              borderRadius: 6,
            }}
          >
            Logout
          </button>
          <button
            onClick={handleReset}
            style={{
              background: "#659377",
              color: "#fff",
              padding: "0.5rem 1.2rem",
              border: "none",
              borderRadius: 6,
            }}
          >
            Reset Password
          </button>
        </div>

        <div style={{ marginTop: 40 }}>
          {allManuscripts.length > 0 && (
            <section>
              <h2 style={{ color: "#093238" }}>Pending Manuscripts</h2>
              {allManuscripts.map((m) => (
                <div key={m._id} style={{ marginTop: 40 }}>
                  <strong>{m.title}</strong> - <em>{m.status}</em>
                  {m.status === "approved" && (
                    <Link
                      to={`/pay/${m._id}`}
                      style={{ marginLeft: 10, color: "#1e9965" }}
                    >
                      Pay now
                    </Link>
                  )}
                  <hr />
                </div>
              ))}
            </section>
          )}

          {acceptedManuscripts.length > 0 && (
            <section style={{ marginTop: 30 }}>
              <h2 style={{ color: "#093238" }}>Published Manuscripts</h2>
              {acceptedManuscripts.map((m) => (
                <div key={m._id}>
                  <p style={{ marginTop: 40 }}>
                    <strong>{m.title}</strong> -{" "}
                    <Link to={`/journals/${m.journal}/archive`}>
                      view in the current issue
                    </Link>
                  </p>
                  <hr />
                </div>
              ))}
            </section>
          )}
        </div>
        <div style={{ marginTop: 40 }}>
          <Link to={"/results"}>My results</Link>
        </div>
        <div style={{ marginTop: 40 }}>
          <Link to="/review" style={{ color: "#659377", fontWeight: 600 }}>
            Leave a review?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;
