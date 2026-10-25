import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import slugify from "../utils/slug";
import ContentEditorModal from "../components/ContentEditorModal";
import "./EditManuscriptModal.css";

const JOURNAL_OPTIONS = [
  { label: "Domain Health Journal", value: "domain-health-journal" },
  {
    label: "Domain Journal of Science and Technology",
    value: "domain-journal-of-science-and-technology",
  },
  {
    label: "Domain Multidisciplinary Journal",
    value: "domain-multidisciplinary-journal",
  },
  {
    label: "Domain Journal of Biological Sciences",
    value: "domain-journal-of-biological-sciences",
  },
];

const EditManuscriptModal = ({ manuscript, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customId: "",
    slug: "",
    title: "",
    author: "",
    email: "",
    journal: "",
    issue: 1,
    year: new Date().getFullYear(),
    articleType: "",
    country: "",
    abstract: "",
    file: "",
    content: "",
    coAuthors: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Populate form with existing manuscript data
  useEffect(() => {
    if (manuscript) {
      setFormData({
        customId: manuscript.customId || "",
        slug: manuscript.slug || "",
        title: manuscript.title || "",
        author: manuscript.author || "",
        email: manuscript.email || "",
        journal: manuscript.journal || JOURNAL_OPTIONS[0].value,
        issue: manuscript.issue || 1,
        year: manuscript.year || new Date().getFullYear(),
        articleType: manuscript.articleType || "",
        country: manuscript.country || "",
        abstract: manuscript.abstract || "",
        file: manuscript.file || "",
        content: manuscript.content || "",
        coAuthors: manuscript.coAuthors ? [...manuscript.coAuthors] : [],
      });
    }
  }, [manuscript]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleCoAuthorChange = (index, field, value) => {
    const updatedCoAuthors = [...formData.coAuthors];
    updatedCoAuthors[index][field] = value;
    setFormData((prev) => ({ ...prev, coAuthors: updatedCoAuthors }));
    if (error) setError("");
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

  const applySuggestedSlug = () => {
    if (!formData.title) return;
    setFormData((prev) => ({
      ...prev,
      slug: slugify(prev.title),
    }));
  };

  // Upload manuscript PDF file directly to Cloudinary via POST /file
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("Please pick a file to upload first");
      return;
    }

    const uploadPayload = new FormData();
    uploadPayload.append("file", selectedFile);

    setUploadingFile(true);
    setError("");
    setUploadSuccess(false);

    try {
      const res = await axios.post("/file", uploadPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = res.data.url;

      // Update form data state with the newly returned file URL
      setFormData((prev) => ({ ...prev, file: uploadedUrl }));
      setUploadSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Failed to upload new manuscript file",
      );
    } finally {
      setUploadingFile(false);
    }
  };

  // Extract modified fields for PATCH payload
  const getChangedFields = () => {
    const changed = {};
    Object.keys(formData).forEach((key) => {
      const currentVal = formData[key];
      const originalVal = manuscript[key];

      if (key === "coAuthors") {
        if (JSON.stringify(currentVal) !== JSON.stringify(originalVal || [])) {
          changed[key] = currentVal;
        }
      } else if (key === "content") {
        if ((currentVal || "") !== (originalVal || "")) {
          changed[key] = currentVal;
        }
      } else if (key === "issue" || key === "year") {
        if (Number(currentVal) !== Number(originalVal)) {
          changed[key] = Number(currentVal);
        }
      } else if (currentVal !== originalVal) {
        changed[key] = currentVal;
      }
    });
    return changed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const patchPayload = getChangedFields();

    if (Object.keys(patchPayload).length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.patch(
        `/accepted/${manuscript._id}`,
        patchPayload,
      );
      onSuccess(res.data.manuscript || res.data);
      onClose();
    } catch (err) {
      console.error(err);
      const serverMessage =
        err.response?.data?.error || "Failed to update manuscript";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!manuscript) return null;

  const suggestedSlug = formData.title ? slugify(formData.title) : "";

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Edit Accepted Manuscript</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="modal-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Custom ID & Journal Row */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                Manuscript ID (Custom ID){" "}
                <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="customId"
                className="form-input"
                value={formData.customId}
                onChange={handleChange}
                required
                placeholder="e.g. DHJ-2026-001"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Journal</label>
              <select
                name="journal"
                className="form-select"
                value={formData.journal}
                onChange={handleChange}
                required
              >
                {JOURNAL_OPTIONS.map((j) => (
                  <option key={j.value} value={j.value}>
                    {j.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Article Title */}
          <div className="form-group">
            <label className="form-label">
              Article Title <span className="required-star">*</span>
            </label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Article Slug */}
          <div className="form-group">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label className="form-label" style={{ margin: 0 }}>
                Article Slug (SEO URL) <span className="required-star">*</span>
              </label>
              {formData.title && (
                <button
                  type="button"
                  onClick={applySuggestedSlug}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-sage, #659377)",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    textDecoration: "underline",
                  }}
                >
                  ⚡ Generate from title
                </button>
              )}
            </div>
            <input
              type="text"
              name="slug"
              className="form-input"
              style={{ marginTop: "6px" }}
              value={formData.slug}
              onChange={handleChange}
              required
              placeholder="e.g. research-article-title-slug"
            />

            {suggestedSlug && formData.slug !== suggestedSlug && (
              <div style={{ marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={applySuggestedSlug}
                  style={{
                    background: "#e8f5e9",
                    border: "1px solid var(--color-sage, #659377)",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    color: "var(--color-teal-dark, #093238)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: 600,
                  }}
                >
                  💡 Click to apply suggested slug: <u>{suggestedSlug}</u>
                </button>
              </div>
            )}
          </div>

          {/* Primary Author & Email */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Primary Author</label>
              <input
                type="text"
                name="author"
                className="form-input"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Author Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Article Type, Issue & Year */}
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Article Type</label>
              <input
                type="text"
                name="articleType"
                className="form-input"
                value={formData.articleType}
                onChange={handleChange}
                required
                placeholder="e.g. Research Article"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Issue Number</label>
              <input
                type="number"
                name="issue"
                className="form-input"
                min="1"
                value={formData.issue}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="number"
                name="year"
                className="form-input"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Country & File Upload Section */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                name="country"
                className="form-input"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>

            {/* Interactive PDF File Upload */}
            <div className="form-group">
              <label className="form-label">PDF File Reference / Upload</label>
              <input
                type="text"
                name="file"
                className="form-input"
                value={formData.file}
                onChange={handleChange}
                required
                placeholder="Cloudinary File URL"
              />
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  style={{ fontSize: "0.82rem" }}
                />
                <button
                  type="button"
                  className="btn-sage-outline"
                  onClick={handleFileUpload}
                  disabled={!selectedFile || uploadingFile}
                  style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                >
                  {uploadingFile ? "Uploading..." : "Upload New File"}
                </button>
              </div>
              {uploadSuccess && (
                <span
                  style={{
                    color: "var(--color-sage, #659377)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  ✓ File uploaded and path updated!
                </span>
              )}
            </div>
          </div>

          {/* Co-Authors Section */}
          <div className="co-authors-section">
            <div className="co-authors-header">
              <label className="form-label">Co-Authors</label>
              <button
                type="button"
                className="btn-add-coauthor"
                onClick={addCoAuthor}
              >
                + Add Co-Author
              </button>
            </div>

            {formData.coAuthors.map((coAuthor, index) => (
              <div key={index} className="co-author-row">
                <input
                  type="text"
                  placeholder="Co-Author Name"
                  className="form-input"
                  value={coAuthor.name}
                  onChange={(e) =>
                    handleCoAuthorChange(index, "name", e.target.value)
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Co-Author Email"
                  className="form-input"
                  value={coAuthor.email}
                  onChange={(e) =>
                    handleCoAuthorChange(index, "email", e.target.value)
                  }
                  required
                />
                <button
                  type="button"
                  className="btn-remove-coauthor"
                  onClick={() => removeCoAuthor(index)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Article Content */}
          <div className="form-group">
            <label className="form-label">Article Content</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="btn-sage-outline"
                onClick={() => setIsContentModalOpen(true)}
              >
                Edit Article Content
              </button>
              <span style={{ fontSize: "0.85rem" }}>
                {formData.content
                  ? "Structured content added"
                  : "No article content yet"}
              </span>
            </div>
            {isContentModalOpen && (
              <ContentEditorModal
                isOpen={isContentModalOpen}
                onClose={() => setIsContentModalOpen(false)}
                fileUrl={formData.file}
                initialContent={formData.content}
                onSave={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
              />
            )}
          </div>

          {/* Abstract */}
          <div className="form-group">
            <label className="form-label">Abstract</label>
            <textarea
              name="abstract"
              className="form-textarea"
              rows="4"
              value={formData.abstract}
              onChange={handleChange}
              required
            />
          </div>

          {/* Form Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading || uploadingFile}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || uploadingFile}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditManuscriptModal;
