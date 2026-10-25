import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCamera,
  FaPencilAlt,
  FaTrash,
  FaEdit,
  FaEye,
  FaCreditCard,
  FaPlus,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "../api/axios";
import { useAuth } from "../hooks/useAuthor";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import Toast from "./Toast";
import ConfirmDialog from "./ConfirmDialog";
import "../styles/articles.css";
import { reverseSlug } from "../utils/slug";

const AuthorProfile = () => {
  const { user, setUser, logout, sendResetMail } = useAuth();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [allManuscripts, setAllManuscripts] = useState([]);
  const [acceptedManuscripts, setAcceptedManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit Form State
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [newLevel, setNewLevel] = useState(user?.level || 100);
  const [newDepartment, setNewDepartment] = useState(
    user?.department || "anatomy",
  );
  const [newMatricNumber, setNewMatricNumber] = useState(
    user?.matricNumber || "",
  );

  // UI Feedback States
  const [toast, setToast] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchManuscripts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/manuscript/getByUser", {
        withCredentials: true,
      });
      setAllManuscripts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch user manuscripts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccepted = async () => {
    try {
      const res = await axios.get("/accepted");
      setAcceptedManuscripts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch published papers:", err);
    }
  };

  useEffect(() => {
    fetchManuscripts();
    fetchAccepted();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/author/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error(err);
    } finally {
      logout();
    }
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
        { withCredentials: true },
      );
      setUser({ ...user, profilePicture: data.url });
      setToast({ message: "Avatar updated successfully." });
    } catch (err) {
      setToast({ message: "Avatar upload failed.", error: true });
    } finally {
      setUploading(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!newName.trim()) return;
    try {
      await axios.patch(
        "/author/",
        {
          name: newName,
          department: newDepartment,
          level: newLevel,
          matricNumber: newMatricNumber,
        },
        { withCredentials: true },
      );
      setUser({
        ...user,
        name: newName,
        level: newLevel,
        department: newDepartment,
        matricNumber: newMatricNumber,
      });
      setEditingName(false);
      setToast({ message: "Profile details updated." });
    } catch (err) {
      setToast({ message: "Failed to update profile", error: true });
    }
  };

  const handleDeleteManuscript = async () => {
    if (!deleteTargetId) return;
    try {
      await axios.delete(`/manuscript/${deleteTargetId}`, {
        withCredentials: true,
      });
      setAllManuscripts((prev) => prev.filter((m) => m._id !== deleteTargetId));
      setToast({ message: "Manuscript deleted successfully." });
    } catch (err) {
      setToast({
        message: err.response?.data?.error || "Failed to delete manuscript.",
        error: true,
      });
    } finally {
      setDeleteTargetId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      screening: { label: "Screening", bg: "var(--status-screening, #546e7a)" },
      "under-review": {
        label: "Under Review",
        bg: "var(--status-review, #f57c00)",
      },
      approved: { label: "Approved", bg: "var(--status-approved, #2e7d32)" },
      paid: { label: "Paid", bg: "var(--status-paid, #0288d1)" },
      published: { label: "Published", bg: "var(--status-published, #1565c0)" },
      rejected: { label: "Rejected", bg: "var(--status-rejected, #c62828)" },
    };

    const config = statusMap[status] || {
      label: status || "Submitted",
      bg: "var(--color-sage, #659377)",
    };

    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#ffffff",
          backgroundColor: config.bg,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="articles-page">
      {toast && (
        <Toast
          message={toast.message}
          error={toast.error}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteManuscript}
        title="Delete Submission?"
        message="Are you sure you want to delete this manuscript? This action cannot be undone."
      />

      <div className="articles-container">
        {/* AUTHOR PROFILE CARD */}
        <div className="article-main-card" style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={user?.profilePicture || defaultAvatar}
                alt="Avatar"
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid var(--color-sage, #659377)",
                }}
              />
              <label
                htmlFor="avatar-upload"
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  background: "var(--color-sage, #659377)",
                  padding: 8,
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

            <div style={{ flex: 1 }}>
              {!editingName ? (
                <div style={{ lineHeight: "1.8" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <h1
                      style={{
                        margin: 0,
                        fontSize: "1.6rem",
                        color: "var(--color-teal-dark)",
                      }}
                    >
                      {user?.name || "Author"}
                    </h1>
                    <FaPencilAlt
                      size={14}
                      color="var(--color-sage)"
                      style={{ cursor: "pointer" }}
                      onClick={() => setEditingName(true)}
                    />
                  </div>
                  <p
                    style={{
                      margin: "4px 0",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p
                    style={{
                      margin: "4px 0",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <strong>Department:</strong>{" "}
                    {user?.department
                      ? user.department.charAt(0).toUpperCase() +
                        user.department.slice(1)
                      : "Not specified"}
                  </p>
                  <p
                    style={{
                      margin: "4px 0",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <strong>Level:</strong> {user?.level || "N/A"}
                  </p>
                  <p
                    style={{
                      margin: "4px 0",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <strong>Matric No:</strong> {user?.matricNumber || "N/A"}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexDirection: "column",
                    maxWidth: 360,
                  }}
                >
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Full Name"
                    className="search-input"
                    style={{ padding: "8px 12px" }}
                  />
                  <input
                    value={newMatricNumber}
                    placeholder="Matric Number"
                    onChange={(e) => setNewMatricNumber(e.target.value)}
                    className="search-input"
                    style={{ padding: "8px 12px" }}
                  />
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="filter-select"
                  >
                    {[100, 200, 300, 400, 500, 600, 700, 800].map((l) => (
                      <option key={l} value={l}>
                        {l} Level
                      </option>
                    ))}
                  </select>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="filter-select"
                  >
                    {[
                      "anatomy",
                      "pharmacy",
                      "medical laboratory science",
                      "nursing",
                      "medical biochemistry",
                      "physiology",
                      "pharmacology",
                      "medicine and surgery",
                      "dentistry",
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn-sage-primary"
                      onClick={handleNameUpdate}
                    >
                      Save
                    </button>
                    <button
                      className="btn-sage-outline"
                      onClick={() => setEditingName(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {uploading && (
                <p
                  style={{ color: "var(--status-review)", fontSize: "0.85rem" }}
                >
                  Uploading avatar...
                </p>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            <button className="btn-sage-outline" onClick={handleReset}>
              Reset Password
            </button>
            <button
              className="btn-sage-primary"
              style={{ backgroundColor: "var(--status-rejected)" }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* SUBMISSIONS HEADER & CTA TOOLBAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "var(--color-teal-dark)",
                fontSize: "1.5rem",
              }}
            >
              Manuscript Submissions
            </h2>
            <p
              style={{ margin: "4px 0 0 0", color: "var(--color-text-muted)" }}
            >
              Manage your active manuscripts and track editorial review status.
            </p>
          </div>

          <button
            className="btn-sage-primary"
            onClick={() => navigate("/submit")}
          >
            <FaPlus /> Submit Manuscript
          </button>
        </div>

        {/* SUBMISSIONS LIST */}
        {loading ? (
          <div className="articles-list-grid">
            <div className="article-list-card">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
            </div>
          </div>
        ) : allManuscripts.length === 0 ? (
          <div className="state-box">
            <h3>No Submissions Yet</h3>
            <p>You haven't submitted any manuscripts to Domain Journals.</p>
            <button
              className="btn-sage-primary"
              onClick={() => navigate("/submit")}
            >
              Submit Your First Manuscript
            </button>
          </div>
        ) : (
          <div className="articles-list-grid">
            {allManuscripts.map((m) => (
              <div key={m._id} className="article-list-card">
                <div className="card-top-row">
                  <div className="badge-group">
                    {getStatusBadge(m.status)}
                    {m.articleType && (
                      <span className="badge-pill type">{m.articleType}</span>
                    )}
                  </div>
                  {m.customId && (
                    <span className="card-custom-id">{m.customId}</span>
                  )}
                </div>

                <h3 className="card-title">{m.title}</h3>

                <div className="card-authors-row">
                  Journal: <strong>{reverseSlug(m.journal)}</strong>
                </div>

                {/* Rejection comment display */}
                {m.status === "rejected" && m.comment && (
                  <div
                    style={{
                      backgroundColor: "#fdf2f2",
                      borderLeft: "4px solid var(--status-rejected)",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      marginBottom: "14px",
                      fontSize: "0.88rem",
                      color: "var(--status-rejected)",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <FaExclamationTriangle /> Rejection Reason:
                    </div>
                    <p style={{ margin: "4px 0 0 0" }}>{m.comment}</p>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="card-bottom-row" style={{ paddingTop: "14px" }}>
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    <button
                      className="share-btn"
                      onClick={() => navigate(`/status/${m._id}`)}
                    >
                      <FaEye /> Track Status
                    </button>

                    {/* Only show edit if not paid or published */}
                    {!["paid", "published"].includes(m.status) && (
                      <button
                        className="share-btn"
                        onClick={() => navigate(`/edit/${m._id}`)}
                      >
                        <FaEdit /> Edit
                      </button>
                    )}

                    {/* Show Pay Now if approved */}
                    {m.status === "approved" && (
                      <Link
                        to={`/pay/${m._id}`}
                        className="btn-sage-primary"
                        style={{
                          padding: "8px 14px",
                          fontSize: "0.85rem",
                          textDecoration: "none",
                        }}
                      >
                        <FaCreditCard /> Pay Fee
                      </Link>
                    )}

                    {/* Show Delete if not published */}
                    {m.status !== "published" && (
                      <button
                        className="share-btn"
                        style={{
                          color: "var(--status-rejected)",
                          borderColor: "rgba(198, 40, 40, 0.3)",
                        }}
                        onClick={() => setDeleteTargetId(m._id)}
                      >
                        <FaTrash /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PUBLISHED PAPERS SECTION */}
        {acceptedManuscripts.length > 0 && (
          <div style={{ marginTop: "40px" }}>
            <h2
              style={{
                color: "var(--color-teal-dark)",
                fontSize: "1.3rem",
                marginBottom: "16px",
              }}
            >
              Published Articles
            </h2>
            <div className="articles-list-grid">
              {acceptedManuscripts.map((m) => (
                <div
                  key={m._id}
                  className="article-list-card"
                  style={{ padding: "16px 20px" }}
                >
                  <h4
                    style={{
                      margin: "0 0 6px 0",
                      color: "var(--color-teal-dark)",
                    }}
                  >
                    {m.title}
                  </h4>
                  <Link
                    to={`/journals/${m.journal}/archive`}
                    style={{
                      color: "var(--color-sage)",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                    }}
                  >
                    View in Issue Archive →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER QUICK LINKS */}
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            fontSize: "0.92rem",
          }}
        >
          <Link
            to="/results"
            style={{ color: "var(--color-teal-dark)", fontWeight: 600 }}
          >
            🎓 My Exam Results
          </Link>
          <Link
            to="/review"
            style={{ color: "var(--color-sage)", fontWeight: 600 }}
          >
            💬 Leave a Review
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;
