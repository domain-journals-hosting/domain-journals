import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/recentArticles.css";
import { Link } from "react-router-dom";

const RecentArticles = ({ journal = null }) => {
  const [articles, setArticles] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const URL = journal
        ? `/accepted/recent/?journal=${journal}`
        : `/accepted/recent/`;
      try {
        const res = await axios.get(URL);
        setArticles(res.data);
      } catch (err) {
        console.error("Failed to load recent articles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [journal]);

  const visibleArticles = articles.slice(0, visibleCount);

  return (
    <section className="recent-articles">
      <h2 className="recent-articles__title">Recent Articles</h2>

      {loading ? (
        <p className="recent-articles__status">Loading...</p>
      ) : articles.length === 0 ? (
        <p className="recent-articles__status">No recent articles available</p>
      ) : (
        <>
          <ul className="articles-list">
            {visibleArticles.map((m) => {
              const names = [m.author, ...m.coAuthors.map((a) => a.name)];
              const authorsDisplay =
                names.length > 10
                  ? `${m.author.trim().split(" ").slice(-1)[0]} et al.`
                  : names.join(", ");
              return (
                <li key={m._id} className="article-card">
                  <h3 className="article-card__title">{m.title}</h3>
                  <p className="article-card__authors">
                    <span>Author(s):</span>{" "}
                    <span title={names.join(", ")}>{authorsDisplay}</span>
                  </p>
                  <p className="article-card__id">ID: {m.customId}</p>
                  <div className="article-card__actions">
                    <Link to="/view" state={{ manuscript: m }}>
                      <button className="btn-outline">View Abstract</button>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>

          {visibleCount < articles.length && (
            <div className="recent-articles__more">
              <button
                className="btn-primary"
                onClick={() => setVisibleCount((p) => p + 6)}
              >
                Show more
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default RecentArticles;
