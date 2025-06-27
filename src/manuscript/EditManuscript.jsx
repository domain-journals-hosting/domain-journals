import { useState, useEffect } from "react";
import journals, { slug } from "../data/journals";
import "../styles/form.css";
import axios from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import Toast from "../components/Toast";

const EditManuscript = () => {
  const { token } = useParams();
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
  const [errMsg, setErrMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/manuscript/verify/${token}`);
        const m = res.data;
        setAuthor(m.author || "");
        setEmail(m.email);
        setCoAuthors(Array.isArray(m.coAuthors) ? m.coAuthors : []);
        setJournalSlug(m.journal);
        setTitle(m.title);
        setAbstract(m.abstract);
        setExistingFileUrl(m.file);
        setCountry(m.country);
      } catch (err) {
        setErrMsg(err.response?.data?.error);
        setToast({
          message: `There was an error: ${
            err.response?.data?.error || "Something went wrong"
          }`,
          error: true,
        });
        navigate(-1);
      }
    })();
  }, [token, navigate]);

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

    if (newFile) {
      const formData = new FormData();
      formData.append("file", newFile);
      try {
        const res = await axios.post("/file", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        fileUrl = res.data.url;
      } catch (err) {
        setErrMsg("File upload failed, please try again.");
        setLoading(false);
        return;
      }
    }

    const manuscript = {
      author,
      coAuthors,
      email,
      journal: journalSlug,
      title,
      abstract,
      file: fileUrl,
      country,
    };

    try {
      await axios.patch(`/manuscript/${token}`, manuscript);
      navigate("/success");
    } catch (err) {
      setErrMsg("Update failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
      {toast && (
        <Toast
          message={toast.message}
          error={toast.error}
          onClose={() => setToast(null)}
        />
      )}

      <h1>Edit Manuscript</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="author">Name:</label>
        <input
          required
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        <label htmlFor="email">Email:</label>
        <input
          required
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <h2>Co-authors</h2>
        {coAuthors.map((c, i) => (
          <div key={i}>
            <h3>Co-author {i + 1}</h3>
            <input
              style={{ margin: "10px" }}
              type="text"
              value={c.name}
              placeholder="Name"
              onChange={(e) => handleCoAuthorChange(i, "name", e.target.value)}
            />
            <input
              style={{ margin: "10px" }}
              type="text"
              value={c.email}
              placeholder="Email"
              onChange={(e) => handleCoAuthorChange(i, "email", e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={addNewCoAuthor}>
          Add co-author
        </button>

        <label htmlFor="journal">Journal:</label>
        <select
          required
          id="journal"
          value={journalSlug}
          onChange={(e) => setJournalSlug(e.target.value)}
        >
          {journals.map((j, i) => (
            <option key={i} value={slug(j)}>
              {j}
            </option>
          ))}
        </select>

        <label htmlFor="title">Manuscript Title:</label>
        <textarea
          required
          id="title"
          rows={5}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        ></textarea>

        <label htmlFor="abstract">Abstract:</label>
        <textarea
          required
          id="abstract"
          rows={5}
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
        ></textarea>

        {existingFileUrl && (
          <>
            <label>Current File:</label>
            <div style={{ marginBottom: "10px" }}>
              <a
                href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                  existingFileUrl
                )}&embedded=true`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View File
              </a>{" "}
              |{" "}
              <a
                href={existingFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                Download
              </a>
            </div>
          </>
        )}

        <label htmlFor="file">Upload new file (optional):</label>
        <input
          id="file"
          type="file"
          accept=".docx,.doc,.pdf"
          onChange={(e) => setNewFile(e.target.files[0])}
        />

        <label htmlFor="country">Country:</label>
        <select
          required
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">--Choose a country--</option>
          {countries.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>

        {errMsg && <p style={{ color: "red" }}>{errMsg}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Manuscript"}
        </button>
      </form>
    </div>
  );
};

export default EditManuscript;
