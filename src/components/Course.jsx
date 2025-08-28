import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/course.css";
import { useParams } from "react-router-dom";

const Course = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendBase = import.meta.env.VITE_API_BASE_URL;
  const downloadLink = (file) => {
    console.log(file);
    return file.endsWith(".doc")
      ? file
      : `${backendBase}/file?url=${encodeURIComponent(file)}`;
  };

  useEffect(() => {
    const getCourse = async () => {
      try {
        const response = await axios.get(`"/course/${courseId}`);
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
  if (!courseId || (!loading && !course))
    return <p className="loading">There was a problem loading this</p>;
  if (loading) return <p className="loading">Loading course...</p>;

  return (
    <div className="course-container">
      <h2 className="course-title">Available Course</h2>
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
          {course.outline.map((item, i) => (
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
        </div>
      </div>
    </div>
  );
};

export default Course;
