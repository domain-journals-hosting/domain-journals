import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/recentArticles.css";
import { Link } from "react-router-dom";

const RecentArticles = () => {
  const [articles, setArticles] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const backendBase = import.meta.env.VITE_API_BASE_URL;
  const downloadLink = (file) => {
    console.log(file);
    return file.endsWith(".doc")
      ? file
      : `${backendBase}/file?url=${encodeURIComponent(file)}`;
  };
  useEffect(() => {
    const fetchArticles = async () => {
      console.log("Fetching recent articles...");
      try {
        const res = await axios.get("/accepted/recent");
        console.log("Received:", res.data);
        setArticles(res.data);
      } catch (err) {
        console.error("Failed to load recent articles:", err);
      } finally {
        setLoading(false);
      }
    };

    console.log(articles);

    fetchArticles();
  }, []);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const visibleArticles = articles.slice(0, visibleCount);

  return (
    <div className="recent-articles">
      <h2 className="section-title">Recent Articles</h2>

      {loading ? (
        <p className="status-msg">Loading...</p>
      ) : articles.length === 0 ? (
        <p className="status-msg">No recent articles available</p>
      ) : (
        <>
          <ul className="articles-list">
            {visibleArticles.map((m) => (
              <li key={m._id} className="article-card">
                <h3 className="article-title">{m.title}</h3>
                <p
                  title={[m.author, ...m.coAuthors.map((a) => a.name)].join(
                    ", "
                  )}
                >
                  <strong>Author(s):</strong>{" "}
                  {(() => {
                    const names = [
                      m.author,
                      ...m.coAuthors.map((a) => a.name),
                    ].join(", ");
                    return names.length > 100
                      ? names.slice(0, 97) + "..."
                      : names;
                  })()}
                </p>

                <div className="article-actions">
                  <Link to="/view" state={{ manuscript: m }}>
                    <button>📄 View Abstract</button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {visibleCount < articles.length && (
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button className="btn" onClick={handleShowMore}>
                Show more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecentArticles;
