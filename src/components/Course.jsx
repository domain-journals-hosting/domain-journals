import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/courses.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import ConfirmDialog from "./ConfirmDialog";

const Course = () => {
  const { courseId } = useParams();
  console.log(courseId);
  const [course, setCourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const backendBase = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const downloadLink = (file) => {
    console.log(file);
    return file.endsWith(".doc")
      ? file
      : `${backendBase}/file?url=${encodeURIComponent(file)}`;
  };
  const { user } = useUser();
  const isAdmin = user?.role === "admin";
  const deleteCourse = async () => {
    const deleteCourseURL = `/course/${courseId}`;
    const response = await axios.delete(deleteCourseURL);
    console.log(response);
    navigate("/courses");
  };
  const handleOpenText = (item) => {
    navigate("/content", {
      state: {
        heading: course.title,
        title: item.text,
        text: item.text || "",
      },
    });
  };

  useEffect(() => {
    const getCourse = async () => {
      try {
        const response = await axios.get(`/course/${courseId}`);
        setCourse(response.data);
        console.log(response.data);
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };
    getCourse();
  }, [courseId]);
  if (!courseId)
    return <p className="loading">There was a problem loading this</p>;
  if (!loading && !course)
    <p className="loading">There was a problem loading this</p>;
  if (loading) return <p className="loading">Loading course...</p>;

  return (
    <div className="course-container">
      <ConfirmDialog
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => deleteCourse(courseId)}
        message={"Are you sure you want to delete this message?"}
      />
      <div className="course-grid">
        <div key={course._id} className="course-card">
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          {/* Price Section */}
          <div className="course-price">
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
          {/* Outline Section */}
          <h3>Outline</h3>
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
          <h3 style={{ marginTop: "30px" }}>Materials</h3>
          {!course.materials.length
            ? "Nothing to show"
            : course.materials.map((item, i) => (
                <div key={i}>
                  {course.paid ? (
                    <a href={item.link} target="_blank">
                      {item.text}
                    </a>
                  ) : (
                    <p style={{ color: "gray" }}>{item.text}</p>
                  )}
                </div>
              ))}
          <div>
            <h3 style={{ marginTop: "30px" }}>Texts</h3>
            {!course.texts.length ? (
              <p>Nothing to show</p>
            ) : (
              course.texts.map((item, i) => (
                <div key={i}>
                  {course.paid ? (
                    <a
                      onClick={() => handleOpenText(item)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                        fontSize: "16px",
                      }}
                    >
                      {item.title}
                    </a>
                  ) : (
                    <p style={{ color: "gray" }}>{item.title}</p>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="actions">
            {isAdmin && (
              <>
                <Link to={`/editCourse/${course._id}`}>Edit Course</Link>
                <p
                  style={{ color: "crimson" }}
                  onClick={() => setShowModal(true)}
                >
                  Delete Course
                </p>
              </>
            )}
          </div>{" "}
        </div>
      </div>
    </div>
  );
};

export default Course;
