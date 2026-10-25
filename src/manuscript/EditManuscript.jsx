import { useState, useEffect } from "react";
import journals, { slug } from "../data/journals";
import axios from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import Toast from "../components/Toast";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
import "../styles/editManuscript.css";

const EditManuscript = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();

  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [coAuthors, setCoAuthors] = useState([]);
  const [journalSlug, setJournalSlug] = useState(slug(journals[0]));
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [existingFileUrl, setExistingFileUrl] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("");
  const [articleType, setArticleType] = useState("Editorial");

  const [errMsg, setErrMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);

  // Determine fetch and save endpoints based on URL parameters
  const fetchEndpoint = id
    ? `/manuscript/${id}`
    : `/manuscript/verify/${token}`;
  const patchEndpoint = id ? `/manuscript/${id}` : `/manuscript/token/${token}`;

  // Fetch Manuscript Data
  useEffect(() => {
    let isMounted = true;

    const fetchManuscript = async () => {
      try {
        const config = id ? { withCredentials: true } : {};
        const res = await axios.get(fetchEndpoint, config);
        const m = res.data;

        if (!isMounted) return;

        // Status restriction check
        if (["paid", "published"].includes(m.status)) {
          setToast({
            message: `Manuscripts with status '${m.status}' cannot be edited.`,
            error: true,
          });
          setTimeout(() => navigate("/author"), 2000);
          return;
        }

        setAuthor(m.author || "");
        setArticleType(m.articleType || "Editorial");
        setEmail(m.email || "");
        setCoAuthors(Array.isArray(m.coAuthors) ? m.coAuthors : []);
        setJournalSlug(m.journal || slug(journals[0]));
        setTitle(m.title || "");
        setAbstract(m.abstract || "");
        setExistingFileUrl(m.file || "");
        setCountry(m.country || "");
      } catch (err) {
        if (!isMounted) return;
        const message =
          err.response?.data?.error || "Failed to load manuscript details.";
        setErrMsg(message);
        setToast({ message, error: true });
      } finally {
        if (isMounted) setFetching(false);
      }
    };

    if (id || token) {
      fetchManuscript();
    } else {
      setFetching(false);
      setErrMsg("No valid manuscript identifier provided.");
    }

    return () => {
      isMounted = false;
    };
  }, [id, token, fetchEndpoint, navigate]);

  // Fetch Country List
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((res) => res.json())
      .then((data) => {
        const names = data.map((c) => c.name.common).sort();
        setCountries(names);
      })
      .catch(() => {
        setCountries([
          "Nigeria",
          "United States",
          "United Kingdom",
          "Canada",
          "Australia",
          "India",
          "Germany",
          "South Africa",
          "Brazil",
          "Japan",
        ]);
      });
  }, []);

  const addNewCoAuthor = () => {
    setCoAuthors((prev) => [...prev, { name: "", email: "" }]);
  };

  const deleteCoAuthor = (index) => {
    setCoAuthors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCoAuthorChange = (index, field, value) => {
    const updated = [...coAuthors];
    updated[index] = { ...updated[index], [field]: value };
    setCoAuthors(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg(null);
    let fileUrl = existingFileUrl;

    // Optional replacement file upload
    if (newFile) {
      const formData = new FormData();
      formData.append("file", newFile);
      try {
        const res = await axios.post("/file", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        fileUrl = res.data.url;
      } catch (err) {
        setErrMsg("File upload failed, please try again.");
        setLoading(false);
        return;
      }
    }

    const payload = {
      author,
      coAuthors,
      email,
      journal: journalSlug,
      title,
      abstract,
      file: fileUrl,
      country,
      articleType,
    };

    try {
      const config = id ? { withCredentials: true } : {};
      await axios.patch(patchEndpoint, payload, config);

      navigate("/author", {
        state: { toastMessage: "Manuscript updated successfully!" },
      });
    } catch (err) {
      setErrMsg(
        err.response?.data?.error || "Update failed. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div
        className="edit-ms-wrapper"
        style={{ textAlign: "center", padding: "60px 20px" }}
      >
        <p>Loading manuscript details...</p>
      </div>
    );
  }

  return (
    <div className="edit-ms-wrapper">
      {toast && (
        <Toast
          message={toast.message}
          error={toast.error}
          onClose={() => setToast(null)}
        />
      )}

      <button
        type="button"
        onClick={() => navigate("/author")}
        style={{
          background: "none",
          border: "none",
          color: "var(--color-sage, #659377)",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: "16px",
        }}
      >
        <FaArrowLeft /> Back to Dashboard
      </button>

      <h1>Edit Manuscript</h1>

      <form onSubmit={handleSubmit} className="edit-ms-form">
        <label htmlFor="author" className="edit-ms-label">
          Main Author Name:
        </label>
        <input
          required
          id="author"
          type="text"
          className="edit-ms-input"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        <label htmlFor="email" className="edit-ms-label">
          Email Address:
        </label>
        <input
          required
          id="email"
          type="email"
          className="edit-ms-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <h2>Co-authors</h2>
        {coAuthors.map((c, i) => (
          <div key={i} className="edit-ms-coauthor-card">
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "0.92rem" }}>
                Co-author {i + 1}
              </h3>
              <input
                required
                className="edit-ms-input"
                style={{ marginBottom: "8px" }}
                type="text"
                value={c.name}
                placeholder="Full Name"
                onChange={(e) =>
                  handleCoAuthorChange(i, "name", e.target.value)
                }
              />
              <input
                required
                className="edit-ms-input"
                type="email"
                value={c.email}
                placeholder="Email Address"
                onChange={(e) =>
                  handleCoAuthorChange(i, "email", e.target.value)
                }
              />
            </div>
            <button
              type="button"
              onClick={() => deleteCoAuthor(i)}
              style={{
                border: "none",
                background: "none",
                color: "var(--status-rejected, #c62828)",
                cursor: "pointer",
                padding: "8px",
                marginLeft: "10px",
                alignSelf: "flex-start",
              }}
              aria-label={`Delete co-author ${i + 1}`}
            >
              <FaTrash />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addNewCoAuthor}
          style={{
            marginBottom: "20px",
            background: "#e8f5e9",
            color: "var(--color-teal-dark, #093238)",
            border: "1px solid var(--color-sage, #659377)",
            borderRadius: "6px",
            padding: "8px 14px",
            cursor: "pointer",
            fontWeight: 600,
            alignSelf: "flex-start",
          }}
        >
          + Add Co-author
        </button>

        <label htmlFor="journal" className="edit-ms-label">
          Target Journal:
        </label>
        <select
          required
          id="journal"
          className="edit-ms-select"
          value={journalSlug}
          onChange={(e) => setJournalSlug(e.target.value)}
        >
          {journals.map((j, i) => (
            <option key={i} value={slug(j)}>
              {j}
            </option>
          ))}
        </select>

        <label htmlFor="articletype" className="edit-ms-label">
          Article Type:
        </label>
        <select
          required
          id="articletype"
          className="edit-ms-select"
          value={articleType}
          onChange={(e) => setArticleType(e.target.value)}
        >
          <option value="Editorial">Editorial</option>
          <option value="Research Article">Research Article</option>
          <option value="Case Report">Case Report</option>
          <option value="Review Article">Review Article</option>
          <option value="Short Article">Short Article</option>
          <option value="Short Communication">Short Communication</option>
          <option value="Letter to Editor">Letter to Editor</option>
          <option value="Commentry">Commentry</option>
          <option value="Conference Proceeding">Conference Proceeding</option>
          <option value="Rapid Communication">Rapid Communication</option>
          <option value="Special Issue Article">Special Issue Article</option>
          <option value="Annual Meeting Abstract">
            Annual Meeting Abstract
          </option>
          <option value="Meeting Report">Meeting Report</option>
          <option value="Proceedings">Proceedings</option>
          <option value="Expert Review">Expert Review</option>
        </select>

        <label htmlFor="title" className="edit-ms-label">
          Manuscript Title:
        </label>
        <textarea
          required
          id="title"
          className="edit-ms-textarea"
          rows={4}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="abstract" className="edit-ms-label">
          Abstract:
        </label>
        <textarea
          required
          id="abstract"
          className="edit-ms-textarea"
          rows={6}
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
        />

        {existingFileUrl && (
          <div style={{ margin: "12px 0 18px 0" }}>
            <label
              className="edit-ms-label"
              style={{ display: "block", marginBottom: "4px" }}
            >
              Current Manuscript File:
            </label>
            <div style={{ fontSize: "0.9rem" }}>
              <a
                href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                  existingFileUrl,
                )}&embedded=true`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--status-paid, #0288d1)",
                  fontWeight: 600,
                }}
              >
                Preview File
              </a>{" "}
              |{" "}
              <a
                href={existingFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                style={{ color: "var(--color-sage, #659377)", fontWeight: 600 }}
              >
                Download File
              </a>
            </div>
          </div>
        )}

        <label htmlFor="file" className="edit-ms-label">
          Upload New File (Optional replacement):
        </label>
        <input
          id="file"
          type="file"
          className="edit-ms-file-input"
          accept=".docx,.doc,.pdf"
          onChange={(e) => setNewFile(e.target.files[0])}
        />

        <label htmlFor="country" className="edit-ms-label">
          Country of Origin:
        </label>
        <select
          required
          id="country"
          className="edit-ms-select"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">-- Choose a country --</option>
          {countries.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>

        {errMsg && (
          <p
            style={{
              color: "var(--status-rejected, #c62828)",
              fontWeight: 600,
              marginTop: "12px",
            }}
          >
            {errMsg}
          </p>
        )}

        <button type="submit" disabled={loading} className="edit-ms-btn-submit">
          {loading ? "Updating Manuscript..." : "Save Manuscript Updates"}
        </button>
      </form>
    </div>
  );
};

export default EditManuscript;
