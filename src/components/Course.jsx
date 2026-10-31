import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/courses.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import ConfirmDialog from "./ConfirmDialog";
import {
  FaLock,
  FaUnlock,
  FaFileDownload,
  FaExternalLinkAlt,
  FaBookOpen,
  FaGraduationCap,
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaYoutube,
  FaArrowLeft,
} from "react-icons/fa";

// Helper to convert YouTube URLs into embeddable player URLs
const getYouTubeEmbedUrl = (url = "") => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
};

const Course = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTextDrawer, setActiveTextDrawer] = useState(null);

  const backendBase = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  const downloadLink = (file) => {
    return file.endsWith(".doc")
      ? file
      : `${backendBase}/file?url=${encodeURIComponent(file)}`;
  };

  const deleteCourse = async () => {
    try {
      await axios.delete(`/course/${courseId}`);
      navigate("/courses");
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  useEffect(() => {
    const getCourse = async () => {
      try {
        const response = await axios.get(`/course/${courseId}`);
        setCourse(response.data);
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };
    getCourse();
  }, [courseId]);

  if (loading)
    return <p className="courses-loading">Loading course contents...</p>;
  if (!course)
    return <p className="courses-loading">Unable to load requested course.</p>;

  return (
    <div className="courses-container">
      {/* Back Navigation */}
      <button
        type="button"
        className="back-to-courses-btn"
        onClick={() => navigate("/courses")}
      >
        <FaArrowLeft /> Back to Courses
      </button>

      <div className="single-course-card">
        {/* Header Header */}
        <div className="course-card__header">
          <div className="course-title-row">
            <h1>{course.title}</h1>
            <span
              className={`access-pill ${course.paid ? "unlocked" : "locked"}`}
            >
              {course.paid ? <FaUnlock /> : <FaLock />}
              {course.paid ? "Full Access" : "Preview Mode"}
            </span>
          </div>
          <p className="course-description">{course.description}</p>

          <div className="course-price-banner">
            {course.originalPrice ? (
              <>
                <span className="original-price">₦{course.originalPrice}</span>
                <span className="discounted-price">₦{course.price}</span>
                {course.off && (
                  <span className="discount-badge">
                    {Math.round(course.off)}% OFF
                  </span>
                )}
              </>
            ) : (
              <span className="discounted-price">₦{course.price}</span>
            )}
          </div>
        </div>

        <div className="course-card__body">
          {/* Outline Section */}
          <div className="course-section-block">
            <h3 className="section-label">
              <FaBookOpen className="section-icon" />
              {course.outlineHeading || "Course Outline"}
            </h3>
            {!course.outline?.length ? (
              <p className="empty-text">No outline modules uploaded yet.</p>
            ) : (
              <ul className="content-list">
                {course.outline.map((item, i) => (
                  <li key={i} className="content-item">
                    {course.paid ? (
                      <a
                        href={downloadLink(item.file)}
                        download
                        className="active-link"
                      >
                        <FaFileDownload className="item-icon" /> {item.title}
                      </a>
                    ) : (
                      <span className="locked-text">
                        <FaLock className="item-icon" /> {item.title}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Materials & Embedded Videos Section */}
          <div className="course-section-block">
            <h3 className="section-label">
              <FaExternalLinkAlt className="section-icon" />
              {course.materialsHeading || "Study Materials & Video Lectures"}
            </h3>
            {!course.materials?.length ? (
              <p className="empty-text">
                No supplementary materials uploaded yet.
              </p>
            ) : (
              <div className="materials-wrapper">
                {course.materials.map((item, i) => {
                  const embedUrl = getYouTubeEmbedUrl(item.link);

                  return (
                    <div key={i} className="material-entry">
                      {embedUrl && course.paid ? (
                        /* Embedded YouTube Player for Paid Users */
                        <div className="video-player-card">
                          <p className="video-title">
                            <FaYoutube className="yt-icon" /> {item.text}
                          </p>
                          <div className="video-embed-container">
                            <iframe
                              src={embedUrl}
                              title={item.text}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        </div>
                      ) : course.paid ? (
                        /* External Link */
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="active-link"
                        >
                          <FaExternalLinkAlt className="item-icon" />{" "}
                          {item.text}
                        </a>
                      ) : (
                        /* Locked Material Indicator */
                        <span className="locked-text">
                          <FaLock className="item-icon" /> {item.text}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reading Texts Section */}
          <div className="course-section-block">
            <h3 className="section-label">
              <FaBookOpen className="section-icon" />
              {course.textsHeading || "Course Texts"}
            </h3>
            {!course.texts?.length ? (
              <p className="empty-text">No text modules uploaded yet.</p>
            ) : (
              <ul className="content-list">
                {course.texts.map((item, i) => (
                  <li key={i} className="content-item">
                    {course.paid ? (
                      <button
                        type="button"
                        onClick={() => setActiveTextDrawer(item)}
                        className="active-text-btn"
                      >
                        <FaBookOpen className="item-icon" /> {item.title}
                      </button>
                    ) : (
                      <span className="locked-text">
                        <FaLock className="item-icon" /> {item.title}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Examinations Section */}
          <div className="course-section-block">
            <h3 className="section-label">
              <FaGraduationCap className="section-icon" />
              Linked Examinations
            </h3>
            {course.paid && course.exams?.length ? (
              <ul className="content-list">
                {course.exams.map((exam) => (
                  <li key={exam._id} className="content-item">
                    <Link to={`/exam/${exam._id}`} className="exam-link">
                      <FaGraduationCap className="item-icon" />{" "}
                      {exam.description}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">
                {course.paid
                  ? "No active examinations assigned to this course."
                  : "Unlock course to view assigned examinations."}
              </p>
            )}
          </div>
        </div>

        {/* Footer Admin Actions */}
        {isAdmin && (
          <div className="course-card__footer">
            <div className="admin-actions">
              <Link to={`/editCourse/${course._id}`} className="admin-btn edit">
                <FaEdit /> Edit Course Structure
              </Link>
              <button
                type="button"
                className="admin-btn delete"
                onClick={() => setShowModal(true)}
              >
                <FaTrashAlt /> Delete Course
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={deleteCourse}
        title="Delete Course"
        message={`Are you sure you want to delete "${course.title}"? This operation cannot be undone.`}
      />

      {/* Inline Sliding Reader Drawer */}
      {activeTextDrawer && (
        <div
          className="text-drawer-backdrop"
          onClick={() => setActiveTextDrawer(null)}
        >
          <div
            className="text-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-drawer-header">
              <div className="text-drawer-title-group">
                <span className="drawer-course-tag">{course.title}</span>
                <h2>{activeTextDrawer.title}</h2>
              </div>
              <button
                type="button"
                className="text-drawer-close"
                onClick={() => setActiveTextDrawer(null)}
                aria-label="Close reader"
              >
                <FaTimes />
              </button>
            </div>

            <div className="text-drawer-body">
              <div className="text-reader-content">
                {activeTextDrawer.text ||
                  activeTextDrawer.content ||
                  "No text body available."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Course;
