import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/courses.css";
import PaymentModal from "./PaymentModal";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import ConfirmDialog from "./ConfirmDialog";

const Courses = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const backendBase = import.meta.env.VITE_API_BASE_URL;
  const isAdmin = user?.role === "admin";
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (text) => {
    navigate("/content", {
      state: {
        title: text.title,
        text: text.text,
        heading: selectedCourse.title,
      },
    });
  };
  const downloadLink = (file) => {
    return file.endsWith(".doc")
      ? file
      : `${backendBase}/file?url=${encodeURIComponent(file)}`;
  };

  const getAllCourses = async () => {
    try {
      const response = await axios.get("/course");
      setCourses(response.data);
      console.log(response.data);
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
    const courseId = selectedCourse._id;
    const deleteCourseURL = `/course/${courseId}`;
    const response = await axios.delete(deleteCourseURL);
    setCourses((prev) => prev.filter((c) => c._id !== courseId));
    console.log(response);
  };

  useEffect(() => {
    getAllCourses();
  }, []);

  if (loading) return <p className="loading">Loading courses...</p>;

  return (
    <div className="courses-container">
      <h2 className="courses-title">Available Courses</h2>
      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course._id} className="course-card">
            <h3>{course.title}</h3>
            <p>{course.description}</p>

            {/* Price Section */}
            <div className="course-price">
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

            {/* Outline Section */}
            <h3>{course.outlineHeading || "Outline"}</h3>
            {!course.outline.length
              ? "Nothing to show"
              : course.outline.map((item, i) => (
                  <div key={i}>
                    {course.paid ? (
                      <a href={downloadLink(item.file)} download>
                        {item.title}
                      </a>
                    ) : (
                      <p style={{ color: "gray" }}>{item.title}</p>
                    )}
                  </div>
                ))}

            <h3 style={{ marginTop: "30px" }}>
              {course.materialsHeading || "Materials"}
            </h3>
            {!course.materials.length
              ? "Nothing to show"
              : course.materials.map((material, i) => (
                  <div key={i}>
                    {course.paid ? (
                      <a href={material.link} target="_blank">
                        {material.text}
                      </a>
                    ) : (
                      <p style={{ color: "gray" }}>{material.text}</p>
                    )}
                  </div>
                ))}
            <div>
              <h3 style={{ marginTop: "30px" }}>
                {course.textsHeading || "Texts"}
              </h3>
              {!course?.texts?.length
                ? "Nothing to show"
                : course.texts.map((text, i) => (
                    <div key={i} style={{ marginBottom: "8px" }}>
                      {course.paid ? (
                        <a
                          onClick={() => handleNavigate(text)}
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          {text.title}
                        </a>
                      ) : (
                        <p style={{ color: "gray", margin: 0 }}>{text.title}</p>
                      )}
                    </div>
                  ))}
            </div>
            <div>
              <br />
              <h4>Exams</h4>
              {course.paid && course.exams.length ? (
                course.exams.map((exam) => (
                  <Link
                    style={{ marginTop: "20px", display: "block" }}
                    to={`/exam/${exam._id}`}
                  >
                    {exam.description}
                  </Link>
                ))
              ) : (
                <p>No exams yet </p>
              )}
            </div>
            {/* Actions */}
            <div className="actions">
              {course.paid ? (
                <Link to={course._id}>View course</Link>
              ) : (
                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setOpen(true);
                  }}
                  className="pay-btn"
                >
                  Pay
                </button>
              )}
              {isAdmin && (
                <>
                  <Link to={`/editCourse/${course._id}`}>Edit Course</Link>
                  <p
                    style={{ color: "crimson" }}
                    onClick={() => initiateDeletion(course)}
                  >
                    Delete Course
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => deleteCourse(selectedCourse._id)}
        message={"Are you sure you want to delete this course?"}
      />
      {/* Only render ONE modal */}
      {selectedCourse && (
        <PaymentModal
          course={selectedCourse}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default Courses;
