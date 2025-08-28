import React, { useState, useRef, useEffect } from "react";
import axios from "../api/axios";

const NewCourse = ({ onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [outline, setOutline] = useState([{ title: "", file: "" }]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});

  const fileInputRefs = useRef([]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
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

  const addOutline = () => {
    setOutline([...outline, { title: "", file: "" }]);
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
      });
      setToast({ message: "Course created successfully" });
      setTitle("");
      setDescription("");
      setPrice("");
      setOriginalPrice("");
      setOutline([{ title: "", file: "" }]);
      if (onCreated) onCreated();
    } catch (err) {
      console.log(err);
      setToast({ message: err?.response?.data?.error || "Error", error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Add New Course</h2>
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

      <form onSubmit={handleSubmit}>
        <div style={{ width: "100%" }}>
          <input
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div style={{ width: "100%" }}>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div style={{ width: "100%" }}>
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div style={{ width: "100%" }}>
          <input
            type="number"
            placeholder="Original Price (optional)"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>

        <div>
          <h3>Course Outline</h3>
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

        <div style={{ marginTop: "15px" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCourse;
