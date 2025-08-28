import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/courses.css";
import { Link, useParams } from "react-router-dom";
import { useUser } from "../hooks/useUser";

const Course = () => {
  const { courseId } = useParams();
  console.log(courseId);
  const [course, setCourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendBase = import.meta.env.VITE_API_BASE_URL;
  const downloadLink = (file) => {
    console.log(file);
    return file.endsWith(".doc")
      ? file
      : `${backendBase}/file?url=${encodeURIComponent(file)}`;
  };
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

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
          <h3>Materials</h3>
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
          <div className="actions">
            {" "}
            {isAdmin && (
              <Link to={`/editCourse/${course._id}`}>Edit Course</Link>
            )}
          </div>{" "}
        </div>
      </div>
    </div>
  );
};

export default Course;
