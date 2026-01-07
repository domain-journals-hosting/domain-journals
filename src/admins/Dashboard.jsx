import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import {
  FaCamera,
  FaPencilAlt,
  FaBars,
  FaTimes,
  FaFileAlt,
  FaCheckCircle,
  FaUsers,
  FaEnvelope,
  FaPlus,
  FaEye,
  FaPaperPlane,
} from "react-icons/fa";
import { useState } from "react";
import axios from "../api/axios";
import useScreenSize from "../hooks/useScreenSize";
import Toast from "../components/Toast";
import RequireUserAuth from "./RequireUserAuth";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { user, setUser, sendResetMail, logout } = useUser();
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    navigate("/admin/forgot");
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

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      {toast && (
        <Toast
          message={toast.message}
          error={toast.error}
          onClose={() => setToast(null)}
        />
      )}

      {/* MOBILE HEADER */}
      <header className="mobile-header">
        <button
          className="menu-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <FaBars />
        </button>
        <h1 className="mobile-header-title">Dashboard</h1>
        <div style={{ width: "40px" }}></div> {/* Spacer for centering */}
      </header>

      {/* OVERLAY */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      ></div>

      {/* SIDEBAR */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-profile">
          <button
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>

          <div className="avatar-container">
            <img
              src={user.profilePicture || defaultAvatar}
              alt="Avatar"
              className="avatar-img"
            />
            <label htmlFor="avatar-upload" className="avatar-edit">
              <FaCamera size={16} />
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

          {!editingName ? (
            <div className="name-section">
              <p className="welcome-text">
                Welcome,
                <strong> {user.name}</strong>
              </p>
              <FaPencilAlt
                size={15}
                className="name-edit-icon"
                onClick={() => setEditingName(true)}
              />
            </div>
          ) : (
            <div className="edit-name-row">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="name-input"
                placeholder="Enter full name"
              />
              <button onClick={handleNameUpdate} className="btn-save">
                Save
              </button>
            </div>
          )}

          {uploading && <p className="upload-status">Uploading...</p>}
        </div>

        {/* SIDEBAR LINKS */}
        {
          <nav className="sidebar-menu">
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
              {
                to: "/admins/submit-archive",
                text: "Submit archive",
                access: "admin",
              },
              {
                to: "/admin/courses",
                text: "Add a course",
                access: "admin",
              },
              {
                to: "/admin/payments",
                text: "Check course payments",
                access: "admin",
              },
              {
                to: "/admin/payments/r",
                text: "Check course payments (With receipts)",
                access: "admin",
              },
              { to: "/check-results", text: "Check results", access: "admin" },
              {
                to: "/admin/reset-author",
                text: "Reset author",
                access: "admin",
              },
            ].map(({ to, text, access }) => (
              <RequireUserAuth
                key={to}
                allowedRoles={access ? access : undefined}
              >
                <Link to={to} className="sidebar-link" onClick={closeSidebar}>
                  {text}
                </Link>
              </RequireUserAuth>
            ))}
          </nav>
        }

        {/* SIDEBAR FOOTER BUTTONS */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
          <button onClick={resetPassword} className="btn-reset">
            Reset password
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="dashboard-main">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-description">
          Welcome to your administrative control panel. Use the sidebar to
          manage actions.
        </p>

        {/* STATS GRID */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon green">
                <FaFileAlt />
              </div>
            </div>
            <div className="stat-value">24</div>
            <div className="stat-label">Total Manuscripts</div>
            <div className="stat-change positive">↑ 12% from last month</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon blue">
                <FaCheckCircle />
              </div>
            </div>
            <div className="stat-value">8</div>
            <div className="stat-label">Pending Reviews</div>
            <div className="stat-change negative">↓ 3 from yesterday</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon purple">
                <FaUsers />
              </div>
            </div>
            <div className="stat-value">156</div>
            <div className="stat-label">Active Users</div>
            <div className="stat-change positive">↑ 8 new this week</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon orange">
                <FaEnvelope />
              </div>
            </div>
            <div className="stat-value">32</div>
            <div className="stat-label">Unread Messages</div>
            <div className="stat-change positive">↑ 5 today</div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-actions">
          <h2 className="quick-actions-title">Quick Actions</h2>
          <div className="action-buttons">
            <RequireUserAuth allowedRoles="admin">
              <Link to="/admin/invite" className="action-btn">
                <div className="action-icon">
                  <FaPlus />
                </div>
                <span>Invite New Member</span>
              </Link>
            </RequireUserAuth>

            <Link to="/admin/review" className="action-btn">
              <div className="action-icon">
                <FaEye />
              </div>
              <span>Review Manuscripts</span>
            </Link>

            <RequireUserAuth allowedRoles="admin">
              <Link to="/admin/newsletter" className="action-btn">
                <div className="action-icon">
                  <FaPaperPlane />
                </div>
                <span>Send Newsletter</span>
              </Link>
            </RequireUserAuth>

            <Link to="/admin/all" className="action-btn">
              <div className="action-icon">
                <FaUsers />
              </div>
              <span>View All Users</span>
            </Link>

            <Link to="/admin/message" className="action-btn">
              <div className="action-icon">
                <FaEnvelope />
              </div>
              <span>Check Messages</span>
            </Link>

            <RequireUserAuth allowedRoles="admin">
              <Link to="/admin/issue" className="action-btn">
                <div className="action-icon">
                  <FaPaperPlane />
                </div>
                <span>Send New Issue</span>
              </Link>
            </RequireUserAuth>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
