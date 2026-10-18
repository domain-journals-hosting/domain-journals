import { useState, useEffect } from "react";
import axios from "../api/axios";
import journals, { slug } from "../data/journals";
import { FaTrash, FaPlus, FaEye, FaFileUpload, FaTimes } from "react-icons/fa";
import "../styles/editAcceptedModal.css";

const EditAcceptedModal = ({ manuscript, isOpen, onClose, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    email: "",
    coAuthors: [],
    journal: "",
    issue: 1,
    year: new Date().getFullYear(),
    articleType: "Research Article",
    abstract: "",
    country: "",
    file: "",
  });

  const [newFile, setNewFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (manuscript) {
      setFormData({
        title: manuscript.title || "",
        author: manuscript.author || "",
        email: manuscript.email || "",
        coAuthors: Array.isArray(manuscript.coAuthors)
          ? manuscript.coAuthors
          : [],
        journal: manuscript.journal || slug(journals[0]),
        issue: manuscript.issue || 1,
        year: manuscript.year || new Date().getFullYear(),
        articleType: manuscript.articleType || "Research Article",
        abstract: manuscript.abstract || "",
        country: manuscript.country || "",
        file: manuscript.file || "",
      });
      setShowPreview(false);
      setNewFile(null);
      setError("");
    }
  }, [manuscript]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoAuthorChange = (index, field, value) => {
    const updated = [...formData.coAuthors];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, coAuthors: updated }));
  };

  const addCoAuthor = () => {
    setFormData((prev) => ({
      ...prev,
      coAuthors: [...prev.coAuthors, { name: "", email: "" }],
    }));
  };

  const removeCoAuthor = (index) => {
    setFormData((prev) => ({
      ...prev,
      coAuthors: prev.coAuthors.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let uploadedFileUrl = formData.file;

    // Handle File Upload if a new file was selected
    if (newFile) {
      const uploadData = new FormData();
      uploadData.append("file", newFile);
      try {
        const res = await axios.post("/file", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedFileUrl = res.data.url;
      } catch (err) {
        console.error("File upload error:", err);
        setError("File upload failed. Please try again.");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        file: uploadedFileUrl,
      };

      await axios.patch(`/accepted/${manuscript._id}`, payload, {
        withCredentials: true,
      });

      onSaveSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to update manuscript.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Edit Published Manuscript</h3>
            <span className="custom-id-tag">{manuscript?.customId}</span>
          </div>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        {error && <div className="modal-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form-body">
          {/* SECTION 1: MANUSCRIPT IDENTIFICATION */}
          <div className="form-section">
            <h4 className="section-title">Title & Classification</h4>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <textarea
                id="title"
                name="title"
                rows={2}
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-grid grid-3">
              <div className="form-group">
                <label htmlFor="journal">Journal</label>
                <select
                  id="journal"
                  name="journal"
                  value={formData.journal}
                  onChange={handleChange}
                >
                  {journals.map((j) => (
                    <option key={slug(j)} value={slug(j)}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="issue">Issue</label>
                <input
                  id="issue"
                  type="number"
                  name="issue"
                  min="1"
                  value={formData.issue}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="year">Year</label>
                <input
                  id="year"
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid grid-2">
              <div className="form-group">
                <label htmlFor="articleType">Article Type</label>
                <select
                  id="articleType"
                  name="articleType"
                  value={formData.articleType}
                  onChange={handleChange}
                >
                  <option value="Editorial">Editorial</option>
                  <option value="Research Article">Research Article</option>
                  <option value="Case Report">Case Report</option>
                  <option value="Review Article">Review Article</option>
                  <option value="Short Article">Short Article</option>
                  <option value="Short Communication">
                    Short Communication
                  </option>
                  <option value="Letter to Editor">Letter to Editor</option>
                  <option value="Commentry">Commentry</option>
                  <option value="Conference Proceeding">
                    Conference Proceeding
                  </option>
                  <option value="Rapid Communication">
                    Rapid Communication
                  </option>
                  <option value="Special Issue Article">
                    Special Issue Article
                  </option>
                  <option value="Annual Meeting Abstract">
                    Annual Meeting Abstract
                  </option>
                  <option value="Meeting Report">Meeting Report</option>
                  <option value="Proceedings">Proceedings</option>
                  <option value="Expert Review">Expert Review</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: AUTHORS */}
          <div className="form-section">
            <h4 className="section-title">Author Information</h4>
            <div className="form-grid grid-2">
              <div className="form-group">
                <label htmlFor="author">Primary Author Name</label>
                <input
                  id="author"
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Primary Author Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="coauthors-block">
              <div className="coauthors-header">
                <h5>Co-Authors ({formData.coAuthors.length})</h5>
                <button
                  type="button"
                  className="btn-add-sm"
                  onClick={addCoAuthor}
                >
                  <FaPlus /> Add Co-Author
                </button>
              </div>

              {formData.coAuthors.map((c, i) => (
                <div key={i} className="coauthor-row">
                  <input
                    type="text"
                    placeholder="Name"
                    value={c.name}
                    onChange={(e) =>
                      handleCoAuthorChange(i, "name", e.target.value)
                    }
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={c.email}
                    onChange={(e) =>
                      handleCoAuthorChange(i, "email", e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    className="btn-remove-sm"
                    onClick={() => removeCoAuthor(i)}
                    title="Remove co-author"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: ABSTRACT & DOCUMENT PREVIEW */}
          <div className="form-section">
            <h4 className="section-title">Abstract & Manuscript File</h4>
            <div className="form-group">
              <label htmlFor="abstract">Abstract</label>
              <textarea
                id="abstract"
                name="abstract"
                rows={5}
                value={formData.abstract}
                onChange={handleChange}
                required
              />
            </div>

            {/* Document Handling & Embedded Iframe */}
            <div className="file-management-box">
              <div className="file-management-header">
                <div>
                  <strong>Document:</strong>
                  {formData.file ? (
                    <span className="file-url-text">{formData.file}</span>
                  ) : (
                    <span className="no-file">No file attached</span>
                  )}
                </div>

                {formData.file && (
                  <button
                    type="button"
                    className="btn-preview-toggle"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <FaEye />{" "}
                    {showPreview ? "Hide Preview" : "Preview Document"}
                  </button>
                )}
              </div>

              {/* Embedded Document Preview Iframe */}
              {showPreview && formData.file && (
                <div className="iframe-preview-container">
                  <iframe
                    title="Manuscript Document Preview"
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                      formData.file,
                    )}&embedded=true`}
                    width="100%"
                    height="380"
                    frameBorder="0"
                  />
                </div>
              )}

              <div className="upload-new-file-group">
                <label htmlFor="newFile">
                  <FaFileUpload /> Upload Replacement File (optional):
                </label>
                <input
                  id="newFile"
                  type="file"
                  accept=".docx,.doc,.pdf"
                  onChange={(e) => setNewFile(e.target.files[0])}
                />
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Saving Changes..." : "Save Manuscript"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAcceptedModal;
