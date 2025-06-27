import { useState, useEffect } from "react";
import journals, { slug } from "../data/journals";
import "../styles/form.css";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
const ManuscriptForm = () => {
  const [author, setAuthor] = useState("");
  const [coAuthors, setCoAuthors] = useState([{ name: "", email: "" }]);
  const [email, setEmail] = useState("");
  const [journalSlug, setJournalSlug] = useState(slug(journals[0]));
  const [articleType, setArticleType] = useState("Editorial");
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [file, setFile] = useState(null);
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("");
  const [errMsg, setErrMsg] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const deleteCoAuthor = (index) => {
    setCoAuthors((prev) => prev.filter((_, i) => i !== index));
  };
  const addNewCoAuthor = () =>
    setCoAuthors((prev) => [...prev, { name: "", email: "" }]);

  const handleCoAuthorChange = (index, field, value) => {
    const updated = [...coAuthors];
    updated[index] = { ...updated[index], [field]: value };
    setCoAuthors(updated);
  };
  useEffect(() => {
    setErrMsg(null);
  }, [author, email, title, abstract, country]);
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
    setLoading(true);
    setErrMsg(null);
    let fileUrl = "";
    e.preventDefault();
    const allCoAuthorsValid = coAuthors.every(
      (c) => c.name.trim() && c.email.trim()
    );
    if (!allCoAuthorsValid) {
      setErrMsg("Please fill in all co-author name and email fields.");
      setLoading(false);
      return;
    }
    if (!file) return setErrMsg("Please select a file");
    const formData = new FormData();
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrMsg("Only .doc, .docx, or  files are allowed.");
      setLoading(false);
      return;
    }

    formData.append("file", file);
    const ext = file.name.split(".").pop();
    formData.append("extension", ext);
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    try {
      const res = await axios.post("/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(res.data.url);
      fileUrl = res.data.url;
    } catch (err) {
      setErrMsg("File upload failed, please try again");
      setLoading(false);
      console.error("upload failed", err);
      return;
    }
    const manuscript = {
      author,
      email,
      journal: journalSlug,
      title,
      abstract,
      file: fileUrl,
      country,
      coAuthors,
      articleType,
    };

    const submit = async () => {
      try {
        const res = await axios.post("/manuscript", manuscript);
        console.log(res.data);
        navigate("/success");
        return;
      } catch (error) {
        setLoading(false);
        console.error("Attempt failed", error);
      }
    };

    submit();
  };

  return (
    <div className="form-wrapper" style={{ paddingTop: "70px" }}>
      <h1>Submit a Manuscript</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          required
          id="name"
          type="text"
          placeholder="Enter your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        <label htmlFor="email">Email:</label>
        <input
          required
          id="email"
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p>We'll never share your email with anyone else</p>

        <h2>Co-authors</h2>
        {coAuthors.map((c, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div style={{ flexGrow: 1 }}>
              <h3>Co-author {i + 1}</h3>
              <input
                required
                style={{ margin: "10px" }}
                type="text"
                value={coAuthors[i].name}
                placeholder="Name"
                onChange={(e) =>
                  handleCoAuthorChange(i, "name", e.target.value)
                }
                id={`co-author-${i}-name`}
              />
              <input
                required
                style={{ margin: "10px" }}
                type="text"
                value={coAuthors[i].email}
                placeholder="Email"
                onChange={(e) =>
                  handleCoAuthorChange(i, "email", e.target.value)
                }
                id={`co-author-${i}-email`}
              />
            </div>
            <button
              type="button"
              onClick={() => deleteCoAuthor(i)}
              style={{
                background: "none",
                border: "none",
                color: "red",
                cursor: "pointer",
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
          style={{
            backgroundColor: "green",
            fontSize: "20px",
            borderRadius: "30px",
          }}
          onClick={addNewCoAuthor}
        >
          Add co-author
        </button>
        <label htmlFor="journal">Journal:</label>
        <select
          required
          id="journal"
          value={journalSlug}
          onChange={(e) => setJournalSlug(e.target.value)}
        >
          {journals.map((j, index) => (
            <option key={index} value={slug(j)}>
              {j}
            </option>
          ))}
        </select>
        <label htmlFor="articletype">Article Type:</label>
        <select
          required
          className="form-select"
          id="articletype"
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

        <label htmlFor="file">Please attach your file as pdf/doc:</label>
        <input
          required
          id="file"
          type="file"
          accept=".pdf, .doc"
          onChange={(e) => setFile(e.target.files[0])}
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
          {loading ? "Sending manuscript..." : "Send Manuscript"}
        </button>
      </form>
    </div>
  );
};

export default ManuscriptForm;
