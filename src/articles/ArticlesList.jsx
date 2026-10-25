import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FaSearch, FaArrowRight, FaCalendarAlt } from "react-icons/fa";
import axios from "../api/axios";
import Toast from "../components/Toast";
import journals from "../data/journals.json";
import "../styles/articles.css";

const formatDateCard = (dateString, fallbackYear) => {
  if (!dateString) return fallbackYear ? `Published: ${fallbackYear}` : "";
  const d = new Date(dateString);
  if (isNaN(d.getTime()))
    return fallbackYear ? `Published: ${fallbackYear}` : "";
  return `Published: ${d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
};

const ArticlesList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJournal, setSelectedJournal] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const navigate = useNavigate();

  const getArticles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/accepted/all");
      setArticles(res.data);
    } catch (e) {
      setError("Failed to fetch articles. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getArticles();
  }, []);

  const yearsList = useMemo(() => {
    const yearsSet = new Set(
      articles.map((a) =>
        a.createdAt ? new Date(a.createdAt).getFullYear() : a.year,
      ),
    );
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const term = searchTerm.toLowerCase();
      const articleYear = article.createdAt
        ? new Date(article.createdAt).getFullYear()
        : article.year;

      const matchesSearch =
        article.title.toLowerCase().includes(term) ||
        article.author.toLowerCase().includes(term) ||
        article.abstract.toLowerCase().includes(term);

      const matchesJournal =
        selectedJournal === "all" || article.journal === selectedJournal;

      const matchesYear =
        selectedYear === "all" || articleYear === Number(selectedYear);

      return matchesSearch && matchesJournal && matchesYear;
    });
  }, [articles, searchTerm, selectedJournal, selectedYear]);

  return (
    <>
      <Helmet>
        <title>Accepted Manuscripts & Articles - Domain Journals</title>
        <meta
          name="description"
          content="Browse peer-reviewed accepted manuscripts and scientific articles published across Domain Journals."
        />
        <link rel="canonical" href="https://domainjournals.com/articles" />
      </Helmet>

      <div className="articles-page">
        {error && (
          <Toast message={error} error={true} onClose={() => setError("")} />
        )}

        <div className="articles-container">
          <header className="articles-header">
            <h1>Accepted Articles & Publications</h1>
            <p>
              Explore peer-reviewed open access articles across our
              discipline-specific journals.
            </p>
          </header>

          {/* Search and Filters Toolbar */}
          <div className="articles-toolbar">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by title, author, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={selectedJournal}
              onChange={(e) => setSelectedJournal(e.target.value)}
            >
              <option value="all">All Journals</option>
              {journals.map((j) => (
                <option key={j.slug} value={j.slug}>
                  {j.title}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="all">All Years</option>
              {yearsList.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* SKELETON LOADING STATE */}
          {loading && (
            <div className="articles-list-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="article-list-card">
                  <div className="card-top-row">
                    <div className="badge-group">
                      <div className="skeleton skeleton-badge" />
                      <div className="skeleton skeleton-badge" />
                    </div>
                    <div
                      className="skeleton skeleton-text"
                      style={{ width: "70px" }}
                    />
                  </div>
                  <div className="skeleton skeleton-title" />
                  <div
                    className="skeleton skeleton-text"
                    style={{ width: "35%" }}
                  />
                  <div
                    className="skeleton skeleton-text"
                    style={{ width: "95%" }}
                  />
                  <div
                    className="skeleton skeleton-text"
                    style={{ width: "80%" }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="state-box">
              <h3>Unable to load articles</h3>
              <p>{error}</p>
              <button className="btn-sage-primary" onClick={getArticles}>
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && filteredArticles.length === 0 && (
            <div className="state-box">
              <h3>No matching articles found</h3>
              <p>Try adjusting your search query or filters.</p>
              {(searchTerm ||
                selectedJournal !== "all" ||
                selectedYear !== "all") && (
                <button
                  className="btn-sage-outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedJournal("all");
                    setSelectedYear("all");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* ARTICLES LIST */}
          {!loading && !error && filteredArticles.length > 0 && (
            <div className="articles-list-grid">
              {filteredArticles.map((a) => {
                const journalData = journals.find((j) => j.slug === a.journal);
                const journalTitle = journalData
                  ? journalData.title
                  : a.journal;

                return (
                  <article
                    key={a._id}
                    className="article-list-card"
                    onClick={() => navigate(`/articles/${a.slug}`)}
                  >
                    <div className="card-top-row">
                      <div className="badge-group">
                        <span className="badge-pill journal">
                          {journalTitle}
                        </span>
                        <span className="badge-pill type">{a.articleType}</span>
                      </div>
                      <span className="card-custom-id">{a.customId}</span>
                    </div>

                    <h2 className="card-title">{a.title}</h2>

                    <div className="card-authors-row">
                      By <strong>{a.author}</strong>
                      {a.coAuthors.length > 0 &&
                        ` et al. (${a.coAuthors.length} co-author${a.coAuthors.length > 1 ? "s" : ""})`}
                    </div>

                    <p className="card-abstract-snippet">{a.abstract}</p>

                    <div className="card-bottom-row">
                      <span>
                        <FaCalendarAlt
                          style={{
                            marginRight: "6px",
                            color: "var(--color-sage, #659377)",
                          }}
                        />
                        {formatDateCard(a.createdAt, a.year)} • Issue #{a.issue}{" "}
                        • {a.country}
                      </span>
                      <span className="card-read-link">
                        Read Full Article <FaArrowRight />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ArticlesList;
