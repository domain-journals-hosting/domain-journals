import { useState, useEffect } from "react";
import journals, { slug } from "../data/journals";
import "../styles/manuscriptForm.css";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus } from "react-icons/fa";
import { Helmet } from "react-helmet";

const articleTypes = [
  "Editorial",
  "Research Article",
  "Case Report",
  "Review Article",
  "Short Article",
  "Short Communication",
  "Letter to Editor",
  "Commentary",
  "Conference Proceeding",
  "Rapid Communication",
  "Special Issue Article",
  "Annual Meeting Abstract",
  "Meeting Report",
  "Proceedings",
  "Expert Review",
];

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setErrMsg(null);
  }, [author, email, title, abstract, country]);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((res) => res.json())
      .then((data) => {
        setCountries(data.map((c) => c.name.common).sort());
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

  const addCoAuthor = () =>
    setCoAuthors((prev) => [...prev, { name: "", email: "" }]);

  const deleteCoAuthor = (index) =>
    setCoAuthors((prev) => prev.filter((_, i) => i !== index));

  const handleCoAuthorChange = (index, field, value) => {
    const updated = [...coAuthors];
    updated[index] = { ...updated[index], [field]: value };
    setCoAuthors(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg(null);

    const allCoAuthorsValid = coAuthors.every(
      (c) => c.name.trim() && c.email.trim(),
    );
    if (!allCoAuthorsValid) {
      setErrMsg("Please fill in all co-author name and email fields.");
      setLoading(false);
      return;
    }
    if (!file) {
      setErrMsg("Please select a file.");
      setLoading(false);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrMsg("Only .pdf, .doc, or .docx files are allowed.");
      setLoading(false);
      return;
    }

    let fileUrl = "";
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("extension", file.name.split(".").pop());
      const res = await axios.post("/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fileUrl = res.data.url;
    } catch (err) {
      setErrMsg("File upload failed, please try again.");
      setLoading(false);
      return;
    }

    try {
      await axios.post("/manuscript", {
        author,
        email,
        journal: journalSlug,
        title,
        abstract,
        file: fileUrl,
        country,
        coAuthors,
        articleType,
      });
      navigate("/success");
    } catch (error) {
      setLoading(false);
      if (!error?.response) return setErrMsg("No server response");
      setErrMsg(error?.response?.data?.error || "Submission failed");
    }
  };

  return (
    <>
      <Helmet>
        <title>Submit Manuscript - Domain Journals</title>
        <meta
          name="description"
          content="Submit your manuscript or research article for peer-reviewed publication on Domain Journals."
        />
        <link rel="canonical" href="https://domainjournals.com/submit" />
      </Helmet>

      <div className="manuscript-page">
        <div className="manuscript-header">
          <h1>Submit a Manuscript</h1>
          <p>
            Fill in the details below to submit your research for peer review.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="manuscript-form">
          <section className="form-section">
            <h2 className="form-section__title">Author information</h2>

            <div className="form-field">
              <label htmlFor="name">Full name</label>
              <input
                required
                id="name"
                type="text"
                placeholder="Your full name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                required
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="form-field__hint">
                We'll never share your email with anyone else.
              </span>
            </div>

            <div className="form-field">
              <label htmlFor="country">Country</label>
              <select
                required
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Select your country</option>
                {countries.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section__header">
              <h2 className="form-section__title">Co-authors</h2>
              <button
                type="button"
                className="btn-add-coauthor"
                onClick={addCoAuthor}
              >
                <FaPlus /> Add co-author
              </button>
            </div>

            {coAuthors.map((c, i) => (
              <div key={i} className="coauthor-row">
                <div className="coauthor-row__fields">
                  <div className="form-field">
                    <label htmlFor={`coauthor-name-${i}`}>
                      Co-author {i + 1} — name
                    </label>
                    <input
                      required
                      id={`coauthor-name-${i}`}
                      type="text"
                      placeholder="Full name"
                      value={c.name}
                      onChange={(e) =>
                        handleCoAuthorChange(i, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor={`coauthor-email-${i}`}>Email</label>
                    <input
                      required
                      id={`coauthor-email-${i}`}
                      type="email"
                      placeholder="Email address"
                      value={c.email}
                      onChange={(e) =>
                        handleCoAuthorChange(i, "email", e.target.value)
                      }
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-delete-coauthor"
                  onClick={() => deleteCoAuthor(i)}
                  aria-label={`Remove co-author ${i + 1}`}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </section>

          <section className="form-section">
            <h2 className="form-section__title">Manuscript details</h2>

            <div className="form-field">
              <label htmlFor="journal">Journal</label>
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
            </div>

            <div className="form-field">
              <label htmlFor="articletype">Article type</label>
              <select
                required
                id="articletype"
                value={articleType}
                onChange={(e) => setArticleType(e.target.value)}
              >
                {articleTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="title">Manuscript title</label>
              <textarea
                required
                id="title"
                rows={4}
                placeholder="Enter the full title of your manuscript"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="abstract">Abstract</label>
              <textarea
                required
                id="abstract"
                rows={8}
                placeholder="Enter your abstract"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="file">Manuscript file</label>
              <span className="form-field__hint">
                Accepted formats: .pdf, .doc, .docx
              </span>
              <input
                required
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="file-input"
              />
            </div>
          </section>

          {errMsg && <p className="form-error">{errMsg}</p>}

          <button type="submit" className="form-submit-btn" disabled={loading}>
            {loading ? "Submitting manuscript..." : "Submit manuscript"}
          </button>
        </form>
      </div>
    </>
  );
};

export default ManuscriptForm;
