import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/currentIssue.css";
import JournalHeader from "./JournalHeader";
import RecentArticles from "../components/RecentArticles";
export const CurrentIssue = () => {
  const { slug } = useParams();
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const backendBase = import.meta.env.VITE_API_BASE_URL;
  const downloadLink = (file) => {
    console.log(file);
    return file.endsWith(".doc")
      ? file
      : `${backendBase}/file?url=${encodeURIComponent(file)}`;
  };

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

  return (
    <div style={{ width: "100%" }}>
      <JournalHeader slug={slug} />
      <div className="current-issue">
        <h1>Current Issue</h1>
        <br />
        {loading && <p>Loading...</p>}
        {err && <p className="errors">{err}</p>}
        {!loading && !err && manuscripts.length === 0 ? (
          <p>No manuscripts in this issue yet.</p>
        ) : (
          <ul className="manuscript-list">
            {manuscripts.map((m) => (
              <li key={m._id} className="manuscript-item">
                <h3>{m.title}</h3>
                <p>
                  <strong>Author(s):</strong> {m.name}
                </p>
                <div className="actions">
                  <a
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                      m.file
                    )}&embedded=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button>View</button>
                  </a>
                  <a href={downloadLink(m.file)} download>
                    <button>Download</button>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <RecentArticles />
    </div>
  );
};
