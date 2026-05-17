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
    <div className="current-issue-page">
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

        {loading && <p className="current-issue__status">Loading...</p>}
        {err && <p className="current-issue__error">{err}</p>}
        {!loading && !err && manuscripts.length === 0 && (
          <p className="current-issue__status">
            No manuscripts in this issue yet.
          </p>
        )}

        {!loading && !err && manuscripts.length > 0 && (
          <ul className="manuscript-list">
            {manuscripts.map((m) => {
              const names = [m.author, ...m.coAuthors.map((a) => a.name)];
              const authorsDisplay =
                names.length > 10
                  ? `${m.author.trim().split(" ").slice(-1)[0]} et al.`
                  : names.join(", ");
              return (
                <li key={m._id} className="manuscript-item">
                  <span className="manuscript-item__type">
                    {m.articleType || "Editorial"}
                  </span>
                  <h3 className="manuscript-item__title">{m.title}</h3>
                  <p className="manuscript-item__id">ID: {m.customId}</p>
                  <p
                    className="manuscript-item__authors"
                    title={names.join(", ")}
                  >
                    <span>Author(s):</span> {authorsDisplay}
                  </p>
                  <div className="manuscript-item__actions">
                    <Link to="/view" state={{ manuscript: m }}>
                      <button className="btn-outline">View Abstract</button>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
