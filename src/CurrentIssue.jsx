import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "./api/axios";
import "./styles/currentIssue.css";
import JournalHeader from "./JournalHeader";
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

  if (loading) return <p>Loading current issue...</p>;
  if (err) return <p style={{ color: "red" }}>{err}</p>;
  console.log(manuscripts);
  return (
    <>
      <JournalHeader slug={slug} />
      <div className="current-issue">
        <h2>Current Issue</h2>
        {manuscripts.length === 0 ? (
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
                  <a href={m.file} download>
                    <button>Download</button>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};
