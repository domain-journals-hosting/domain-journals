import { useState, useEffect } from "react";
import journals, {slug} from "../data/journals";
import "../styles/form.css";
import axios from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";



const EditManuscript = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [journalSlug, setJournalSlug] = useState(slug(journals[0]));
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [existingFileUrl, setExistingFileUrl] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("");
  const [errMsg, setErrMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/manuscript/verify/${token}`);
        const m = res.data;
        setName(m.name);
        setEmail(m.email);
        setJournalSlug(m.journal);
        setTitle(m.title);
        setAbstract(m.abstract);
        setExistingFileUrl(m.file);
        setCountry(m.country);
      } catch (err) {
        setErrMsg(err.response.data.error);
        alert(`There was an error: ${err.response.data.error}`);
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
      name,
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
      <h1>Edit Manuscript</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          required
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="email">Email:</label>
        <input
          required
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

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
                style={{ marginRight: "10px" }}
              >
                View File
              </a>
              <a
                href={existingFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                Download File
              </a>
            </div>
          </>
        )}

        <label htmlFor="file">Upload new file (optional):</label>
        <input
          id="file"
          type="file"
          accept=".docx, .doc, "
          onChange={(e) => setNewFile(e.target.files[0])}
        />
        <p style={{ fontSize: "0.9rem", marginTop: "5px" }}>
          (Leave blank if you don't want to replace the current file)
        </p>

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

        <button type="submit">
          {loading ? "Updating..." : "Update Manuscript"}
        </button>
      </form>
    </div>
  );
};

export default EditManuscript;
