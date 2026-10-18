import { useState, useEffect } from "react";
import axios from "../api/axios";

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
    if (error) setError(""); // Clear error on change
  };

  // Co-authors handling
  const handleCoAuthorChange = (index, field, value) => {
    const updatedCoAuthors = [...formData.coAuthors];
    updatedCoAuthors[index][field] = value;
    setFormData((prev) => ({ ...prev, coAuthors: updatedCoAuthors }));
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

    try {
      // Endpoint handles customId uniqueness check & returns 409 if taken
      const res = await axios.put(`/accepted/${manuscript._id}`, formData);
      onSuccess(res.data.manuscript || res.data);
      onClose();
    } catch (err) {
      const serverMessage =
        err.response?.data?.error || "Failed to update manuscript";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!manuscript) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Edit Accepted Manuscript</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Custom ID & Journal Row */}
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Manuscript ID (Custom ID) <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="customId"
                value={formData.customId}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="e.g. DHJ-2026-001"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Journal</label>
              <select
                name="journal"
                value={formData.journal}
                onChange={handleChange}
                required
                style={styles.select}
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
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Article Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {/* Main Author & Email */}
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Primary Author</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Author Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Article Type, Issue & Year */}
          <div style={styles.rowThree}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Article Type</label>
              <input
                type="text"
                name="articleType"
                value={formData.articleType}
                onChange={handleChange}
                required
                placeholder="e.g. Research Article"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Issue Number</label>
              <input
                type="number"
                name="issue"
                min="1"
                value={formData.issue}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Country & File Path/URL */}
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>PDF File Reference / Path</label>
              <input
                type="text"
                name="file"
                value={formData.file}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Co-Authors Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <label style={styles.label}>Co-Authors</label>
              <button
                type="button"
                onClick={addCoAuthor}
                style={styles.addCoAuthorBtn}
              >
                + Add Co-Author
              </button>
            </div>

            {formData.coAuthors.map((coAuthor, index) => (
              <div key={index} style={styles.coAuthorRow}>
                <input
                  type="text"
                  placeholder="Co-Author Name"
                  value={coAuthor.name}
                  onChange={(e) =>
                    handleCoAuthorChange(index, "name", e.target.value)
                  }
                  required
                  style={{ ...styles.input, flex: 1 }}
                />
                <input
                  type="email"
                  placeholder="Co-Author Email"
                  value={coAuthor.email}
                  onChange={(e) =>
                    handleCoAuthorChange(index, "email", e.target.value)
                  }
                  required
                  style={{ ...styles.input, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => removeCoAuthor(index)}
                  style={styles.removeBtn}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Abstract */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Abstract</label>
            <textarea
              name="abstract"
              rows="4"
              value={formData.abstract}
              onChange={handleChange}
              required
              style={styles.textarea}
            />
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditManuscriptModal;

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(9, 50, 56, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: "14px",
    width: "100%",
    maxWidth: "750px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "28px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #E0E7FF",
    paddingBottom: "16px",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "1.4rem",
    color: "#093238",
    fontWeight: "700",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.8rem",
    cursor: "pointer",
    color: "#546E7A",
  },
  errorAlert: {
    backgroundColor: "#FFEBEE",
    color: "#C62828",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "0.9rem",
    fontWeight: "600",
    border: "1px solid #FFCDD2",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  rowThree: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#093238",
  },
  required: {
    color: "#C62828",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #CFD8DC",
    fontSize: "0.95rem",
    outline: "none",
    color: "#093238",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #CFD8DC",
    fontSize: "0.95rem",
    outline: "none",
    backgroundColor: "#FFF",
    color: "#093238",
  },
  textarea: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #CFD8DC",
    fontSize: "0.95rem",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    color: "#093238",
  },
  section: {
    backgroundColor: "#F8FAF8",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #E0E7FF",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  addCoAuthorBtn: {
    background: "none",
    border: "none",
    color: "#659377",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  coAuthorRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "8px",
  },
  removeBtn: {
    background: "#FFEBEE",
    border: "none",
    color: "#C62828",
    fontSize: "1.2rem",
    borderRadius: "6px",
    width: "32px",
    height: "32px",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "10px",
    borderTop: "1px solid #E0E7FF",
    paddingTop: "16px",
  },
  cancelBtn: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "1px solid #CFD8DC",
    background: "#FFF",
    color: "#546E7A",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 22px",
    borderRadius: "8px",
    border: "none",
    background: "#659377",
    color: "#FFF",
    fontWeight: "600",
    cursor: "pointer",
  },
};
