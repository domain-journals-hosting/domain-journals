import { useState, useEffect } from "react";
import axios from "../api/axios";
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
    coAuthors: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form with existing manuscript data
  useEffect(() => {
    if (manuscript) {
      setFormData({
        customId: manuscript.customId || "",
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

  // Extract only modified fields for PATCH payload
  const getChangedFields = () => {
    const changed = {};
    Object.keys(formData).forEach((key) => {
      const currentVal = formData[key];
      const originalVal = manuscript[key];

      if (key === "coAuthors") {
        if (JSON.stringify(currentVal) !== JSON.stringify(originalVal || [])) {
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

    // If nothing was edited, close without sending an HTTP request
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
      console.log(err);
      const serverMessage =
        err.response?.data?.error || "Failed to update manuscript";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!manuscript) return null;

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

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Article Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
            />
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

          {/* Country & File Reference */}
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

            <div className="form-group">
              <label className="form-label">PDF File Reference / Path</label>
              <input
                type="text"
                name="file"
                className="form-input"
                value={formData.file}
                onChange={handleChange}
                required
              />
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
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditManuscriptModal;
