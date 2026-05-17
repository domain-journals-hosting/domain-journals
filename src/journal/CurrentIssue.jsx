import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/currentIssue.css";
import JournalHeader from "./JournalHeader";
import journals from "../data/journals.json";
import { Helmet } from "react-helmet";
export const CurrentIssue = () => {
  const { slug } = useParams();
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const fetchAccepted = async () => {
      try {
        const journalRes = await axios.get(`/journal/${slug}`);
        const issue = journalRes.data?.issue;

        console.log(journalRes);

        const acceptedRes = await axios.get(`/accepted/${slug}/${issue}`);
        setManuscripts(acceptedRes.data);
      } catch (err) {
        console.error(err);
        setErr("Failed to load current issue.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccepted();
  }, [slug]);
  const journal = journals.find((j) => j.slug === slug);
  const journalTitle = journal?.title || "Journal";
  return (
    <div style={{ width: "100%" }}>
      <Helmet>
        <title>{journalTitle} - Current Issue | Domain Journals</title>
        <meta
          name="description"
          content={`Read the latest published articles and research from the current issue of ${journalTitle}.`}
        />
        <link
          rel="canonical"
          href={`https://www.domainjournals.com/journals/${slug}/current-issue`}
        />
      </Helmet>
      <JournalHeader slug={slug} />
      <div className="current-issue">
        <h1>Current Issue</h1>
        <br />
        {loading && <p className="loading">Loading...</p>}
        {err && <p className="errors">{err}</p>}
        {!loading && !err && manuscripts.length === 0 ? (
          <p>No manuscripts in this issue yet.</p>
        ) : (
          <ul className="manuscript-list">
            {manuscripts.map((m) => (
              <li key={m._id} className="manuscript-item">
                <h5
                  style={{
                    backgroundColor: "blue",
                    width: "fit-content",
                    padding: "5px",
                    borderRadius: "5px",
                    color: "#fff",
                  }}
                >
                  {m.articleType || "Editorial"}
                </h5>
                <h3>{m.title}</h3>
                ID: {m.customId}
                <p
                  title={[m.author, ...m.coAuthors.map((a) => a.name)].join(
                    ", ",
                  )}
                >
                  <strong>Author(s): </strong>
                  {(() => {
                    const names = [m.author, ...m.coAuthors.map((a) => a.name)];
                    return names.length > 10
                      ? `${m.author.trim().split(" ").slice(-1)[0]} et al.`
                      : names.join(", ");
                  })()}
                </p>
                <div className="actions">
                  <Link to="/view" state={{ manuscript: m }}>
                    <button>📄 View Abstract</button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
