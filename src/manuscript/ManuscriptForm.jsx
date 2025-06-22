import { useState, useEffect } from "react";
import journals, { slug } from "../data/journals";
import "../styles/form.css";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const ManuscriptForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [journalSlug, setJournalSlug] = useState(slug(journals[0]));
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [file, setFile] = useState(null);
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("");
  const [errMsg, setErrMsg] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setErrMsg(null);
  }, [name, email, title, abstract, country]);
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
      name,
      email,
      journal: journalSlug,
      title,
      abstract,
      file: fileUrl,
      country,
    };
    let attempts = 0;
    const maxAttempts = 5;

    const trySubmit = async () => {
      while (attempts < maxAttempts) {
        try {
          const res = await axios.post("/manuscript", manuscript);
          console.log(res.data);
          navigate("/success");
          return;
        } catch (error) {
          setLoading(false);
          attempts++;
          console.error(`Attempt ${attempts} failed`, error);
          if (attempts === maxAttempts) {
            setErrMsg("Could not submit info, please try again later.");
          }
        }
      }
    };

    trySubmit();
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
          value={name}
          onChange={(e) => setName(e.target.value)}
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
