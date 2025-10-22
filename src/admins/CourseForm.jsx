import React, { useState, useRef, useEffect } from "react";
import axios from "../api/axios";
import { Link, useNavigate, useParams } from "react-router-dom";

const CourseForm = ({ editing = false }) => {
  const { courseId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [outline, setOutline] = useState([{ title: "", file: "" }]);
  const [materials, setMaterials] = useState([{ text: "", link: "" }]);
  const [texts, setTexts] = useState([{ title: "", text: "" }]);
  const [exams, setExams] = useState([]);

  const [outlineHeading, setOutlineHeading] = useState("Course Outline");
  const [materialsHeading, setMaterialsHeading] = useState("Materials");
  const [textsHeading, setTextsHeading] = useState("Texts");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});
  const fileInputRefs = useRef([]);
  const navigate = useNavigate();
  const setCourse = (course) => {
    setTitle(course.title);
    setDescription(course.description);
    setPrice(course.price);
    setTexts(course.texts);
    setOriginalPrice(course.originalPrice);
    setOutlineHeading(course.outlineHeading);
    setMaterialsHeading(course.materialsHeading);
    setTextsHeading(course.textsHeading);
    if (course.outline?.length) setOutline(course.outline);
    if (course.materials?.length) setMaterials(course.materials);
  };

  useEffect(() => {
    const getCourse = async () => {
      console.log("Getting course");
      try {
        const response = await axios.get(`/course/admin/${courseId}`);
        if (editing) setCourse(response.data);
        console.log(response.data);
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setFetching(false);
      }
    };
    const checkCourse = async () => {
      const response = await axios.get(`/exam/all/${courseId}`);
      setExams(response.data);
    };
    if (editing) {
      getCourse();
      checkCourse();
    }
  }, [courseId, editing]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 6000);

    return () => clearTimeout(timer); // cleanup if toast changes/unmounts
  }, [toast]);

  const addOutline = () => {
    setOutline([...outline, { title: "", file: "" }]);
  };

  const handleOutlineChange = (index, key, value) => {
    const updated = [...outline];
    updated[index][key] = value;
    setOutline(updated);
  };
  const removeOutline = (index) => {
    const updated = [...outline];
    updated.splice(index, 1);
    setOutline(updated);
  };
  const addMaterial = () => {
    setMaterials([...materials, { text: "", link: "" }]);
  };
  const handleMaterialChange = (index, key, value) => {
    const updated = [...materials];
    updated[index][key] = value;
    setMaterials(updated);
  };
  const removeMaterial = (index) => {
    const updated = [...materials];
    updated.splice(index, 1);
    setMaterials(updated);
  };
  const addTexts = () => {
    setTexts([...texts, { title: "", texts: "" }]);
  };
  const handleTextsChange = (index, key, value) => {
    const updated = [...texts];
    updated[index][key] = value;
    setTexts(updated);
  };
  const removeTexts = (index) => {
    const updated = [...texts];
    updated.splice(index, 1);
    setTexts(updated);
  };
  const handleFileUpload = async (file, index) => {
    if (!file) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url;

      const updated = [...outline];
      updated[index].file = url;
      setOutline(updated);

      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index].value = "";
      }

      setUploadErrors((prev) => ({ ...prev, [index]: false }));
      setToast({ message: "File uploaded successfully" });
    } catch (err) {
      console.log(err);
      setUploadErrors((prev) => ({ ...prev, [index]: true }));
      setToast({ message: "Upload failed", error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (originalPrice <= price)
        return setToast({
          message: "Original price cannot be less than or equal current price",
          error: true,
        });

      setLoading(true);
      await axios.post("/course", {
        title,
        description,
        price,
        originalPrice,
        outline,
        materials,
        texts,
        outlineHeading,
        materialsHeading,
        textsHeading,
      });
      setToast({ message: "Course created successfully" });
      setTitle("");
      setDescription("");
      setPrice("");
      setOriginalPrice("");
      setOutline([{ title: "", file: "" }]);
    } catch (err) {
      console.log(err);
      setToast({ message: err?.response?.data?.error || "Error", error: true });
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      if (originalPrice <= price)
        return setToast({
          message: "Original price cannot be less than or equal current price",
          error: true,
        });

      setLoading(true);
      await axios.put(`/course/${courseId}`, {
        title,
        description,
        price,
        originalPrice,
        outline,
        materials,
        texts,
        outlineHeading,
        materialsHeading,
        textsHeading,
      });
      setToast({ message: "Course edited successfully" });

      setTitle("");
      setDescription("");
      setPrice("");
      setOriginalPrice("");
      setOutline([{ title: "", file: "" }]);
      navigate(`/courses/${courseId}`);
    } catch (err) {
      console.log(err);
      setToast({ message: err?.response?.data?.error || "Error", error: true });
    } finally {
      setLoading(false);
    }
  };

  if (fetching && editing)
    return <p className="loading">Getting course details</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", marginTop: "50px" }}>
      <h2> {editing ? "Edit" : "Add New"} Course</h2>
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "0",
            right: "0",
            width: "100%",
            marginBottom: "10px",
            padding: "8px",
            borderRadius: "6px",
            backgroundColor: toast.error ? "#ffe0e0" : "#e0ffe0",
            color: toast.error ? "red" : "green",
          }}
        >
          {toast.message}
        </div>
      )}

      <form onSubmit={editing ? handleEdit : handleSubmit}>
        <div style={{ width: "100%" }}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div style={{ width: "100%" }}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div style={{ width: "100%" }}>
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div style={{ width: "100%" }}>
          <label htmlFor="original">Original Price</label>
          <input
            id="original"
            type="number"
            placeholder="Original Price (optional)"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label htmlFor="outline">Outline</label>
          <input
            type="text"
            value={outlineHeading}
            onChange={(e) => setOutlineHeading(e.target.value)}
          />
          {outline.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "6px",
              }}
            >
              <button
                type="button"
                onClick={() => removeOutline(index)}
                style={{
                  backgroundColor: "#ffdddd",
                  color: "red",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                Remove
              </button>

              <input
                placeholder="Section Title"
                value={item.title}
                onChange={(e) =>
                  handleOutlineChange(index, "title", e.target.value)
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                }}
              />
              <input
                type="file"
                accept=".doc,.pdf"
                ref={(el) => (fileInputRefs.current[index] = el)}
                onChange={(e) => handleFileUpload(e.target.files[0], index)}
              />
              {uploadErrors[index] && (
                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRefs.current[index]?.files[0]) {
                      handleFileUpload(
                        fileInputRefs.current[index].files[0],
                        index
                      );
                    } else {
                      setToast({
                        message: "Please pick a file before reuploading",
                        error: true,
                      });
                    }
                  }}
                  style={{
                    backgroundColor: "#ffa500",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginTop: "8px",
                    display: "inline-block",
                  }}
                >
                  Reupload
                </button>
              )}

              {item.file && (
                <div style={{ marginTop: "5px" }}>
                  <a href={item.file} target="_blank" rel="noopener noreferrer">
                    View uploaded file
                  </a>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOutline}
            style={{
              backgroundColor: "#1e90ff",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            + Add Outline Section
          </button>
        </div>
        <div>
          <label htmlFor="materials">Materials</label>

          <input
            type="text"
            value={materialsHeading}
            onChange={(e) => setMaterialsHeading(e.target.value)}
          />
          {materials?.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "6px",
              }}
            >
              <button
                type="button"
                onClick={() => removeMaterial(index)}
                style={{
                  backgroundColor: "#ffdddd",
                  color: "red",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                Remove
              </button>

              <input
                placeholder="Material Text"
                value={item.text}
                onChange={(e) =>
                  handleMaterialChange(index, "text", e.target.value)
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                }}
              />
              <input
                placeholder="Material Link"
                value={item.link}
                onChange={(e) =>
                  handleMaterialChange(index, "link", e.target.value)
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addMaterial}
            style={{
              backgroundColor: "#1e90ff",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            + Add Material Section
          </button>
        </div>
        <div>
          <label htmlFor="texts">Texts</label>

          <input
            type="text"
            value={textsHeading}
            onChange={(e) => setTextsHeading(e.target.value)}
          />
          {texts?.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "6px",
              }}
            >
              <button
                type="button"
                onClick={() => removeTexts(index)}
                style={{
                  backgroundColor: "#ffdddd",
                  color: "red",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                Remove
              </button>

              <input
                placeholder="Text title"
                value={item.title}
                onChange={(e) =>
                  handleTextsChange(index, "title", e.target.value)
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                }}
              />
              <textarea
                placeholder="Paste text here"
                rows={10}
                value={item.text}
                onChange={(e) =>
                  handleTextsChange(index, "text", e.target.value)
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "8px",
                  resize: "none",
                }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addTexts}
            style={{
              backgroundColor: "#1e90ff",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            + Add Texts Section
          </button>
        </div>

        {editing && (
          <div>
            <p>Exams</p>
            {exams.length &&
              exams.map((exam) => (
                <p style={{ marginBottom: "20px" }}>
                  <span>
                    {exam.description}{" "}
                    <Link to={`/edit-exam/${exam._id}`}>Edit exam</Link>
                  </span>
                </p>
              ))}
            <Link to={`/new-exam/${courseId}`}>Add exam</Link>
          </div>
        )}
        <div style={{ marginTop: "15px" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : editing ? "Save edit" : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
