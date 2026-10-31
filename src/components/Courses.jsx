import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/courses.css";
import PaymentModal from "./PaymentModal";
import { Link, useNavigate } from "react-router-dom";
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
} from "react-icons/fa";

const Courses = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTextDrawer, setActiveTextDrawer] = useState(null);

  const backendBase = import.meta.env.VITE_API_BASE_URL;
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();

  const downloadLink = (file) => {
    return file.endsWith(".doc")
      ? file
      : `${backendBase}/file?url=${encodeURIComponent(file)}`;
  };

  const getAllCourses = async () => {
    try {
      const response = await axios.get("/course");
      setCourses(response.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const initiateDeletion = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const deleteCourse = async () => {
    if (!selectedCourse?._id) return;
    try {
      await axios.delete(`/course/${selectedCourse._id}`);
      setCourses((prev) => prev.filter((c) => c._id !== selectedCourse._id));
      setShowModal(false);
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  useEffect(() => {
    getAllCourses();
  }, []);

  if (loading)
    return <p className="courses-loading">Loading course catalog...</p>;

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h1 className="courses-title">Available Courses</h1>
        <p className="courses-subtitle">
          Expand your knowledge with curated academic courses and exam
          preparation guides.
        </p>
      </div>

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course._id} className="course-card">
            <div className="course-card__header">
              <div className="course-title-row">
                <h3>{course.title}</h3>
                <span
                  className={`access-pill ${course.paid ? "unlocked" : "locked"}`}
                >
                  {course.paid ? <FaUnlock /> : <FaLock />}
                  {course.paid ? "Enrolled" : "Locked"}
                </span>
              </div>
              <p className="course-description">{course.description}</p>

              {/* Price Section */}
              <div className="course-price-banner">
                {course.originalPrice ? (
                  <>
                    <span className="original-price">
                      ₦{course.originalPrice}
                    </span>
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
                <h4 className="section-label">
                  <FaBookOpen className="section-icon" />
                  {course.outlineHeading || "Course Outline"}
                </h4>
                {!course.outline?.length ? (
                  <p className="empty-text">No outline items available</p>
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
                            <FaFileDownload className="item-icon" />{" "}
                            {item.title}
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

              {/* Materials Section */}
              <div className="course-section-block">
                <h4 className="section-label">
                  <FaExternalLinkAlt className="section-icon" />
                  {course.materialsHeading || "Study Materials"}
                </h4>
                {!course.materials?.length ? (
                  <p className="empty-text">No study materials available</p>
                ) : (
                  <ul className="content-list">
                    {course.materials.map((material, i) => (
                      <li key={i} className="content-item">
                        {course.paid ? (
                          <a
                            href={material.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="active-link"
                          >
                            <FaExternalLinkAlt className="item-icon" />{" "}
                            {material.text}
                          </a>
                        ) : (
                          <span className="locked-text">
                            <FaLock className="item-icon" /> {material.text}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Texts Section */}
              <div className="course-section-block">
                <h4 className="section-label">
                  <FaBookOpen className="section-icon" />
                  {course.textsHeading || "Reading Texts"}
                </h4>
                {!course.texts?.length ? (
                  <p className="empty-text">No reading texts available</p>
                ) : (
                  <ul className="content-list">
                    {course.texts.map((text, i) => (
                      <li key={i} className="content-item">
                        {course.paid ? (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveTextDrawer({
                                ...text,
                                courseTitle: course.title,
                              })
                            }
                            className="active-text-btn"
                          >
                            <FaBookOpen className="item-icon" /> {text.title}
                          </button>
                        ) : (
                          <span className="locked-text">
                            <FaLock className="item-icon" /> {text.title}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Exams Section */}
              <div className="course-section-block">
                <h4 className="section-label">
                  <FaGraduationCap className="section-icon" />
                  Examinations
                </h4>
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
                      ? "No examinations linked to this course yet."
                      : "Unlock course to access examinations."}
                  </p>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="course-card__footer">
              <div className="primary-actions">
                {course.paid ? (
                  <Link
                    to={`/course/${course._id}`}
                    className="course-btn primary"
                  >
                    View Course
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setOpen(true);
                    }}
                    className="course-btn pay"
                  >
                    Enroll & Pay
                  </button>
                )}
              </div>

              {isAdmin && (
                <div className="admin-actions">
                  <Link
                    to={`/editCourse/${course._id}`}
                    className="admin-btn edit"
                    title="Edit Course"
                  >
                    <FaEdit /> Edit
                  </Link>
                  <button
                    type="button"
                    className="admin-btn delete"
                    onClick={() => initiateDeletion(course)}
                    title="Delete Course"
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={deleteCourse}
        title="Delete Course"
        message={`Are you sure you want to permanently delete "${selectedCourse?.title}"?`}
      />

      {/* Payment Modal */}
      {selectedCourse && (
        <PaymentModal
          course={selectedCourse}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}

      {/* Slide-Over Text Reader Drawer */}
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
                <span className="drawer-course-tag">
                  {activeTextDrawer.courseTitle}
                </span>
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

export default Courses;
