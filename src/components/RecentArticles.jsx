import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/recentArticles.css";

const RecentArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

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

    fetchArticles();
  }, []);

  return (
    <div className="recent-articles">
      <h2 className="section-title">Recent Articles</h2>
      {loading ? (
        <p className="status-msg">Loading...</p>
      ) : articles.length === 0 ? (
        <p className="status-msg">No recent articles available</p>
      ) : (
        <ul className="articles-list">
          {articles.map((m) => (
            <li key={m._id} className="article-card">
              <h3 className="article-title">{m.title}</h3>
              <p>
                <strong>Author(s):</strong> {m.name}
              </p>
              <div className="article-actions">
                <a
                  href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    m.file
                  )}&embedded=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="btn">View</button>
                </a>
                <a href={m.file} download>
                  <button className="btn">Download</button>
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentArticles;
