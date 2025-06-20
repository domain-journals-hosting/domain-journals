import journals, { slug } from "../data/journals";
import axios from "../api/axios";
import { useEffect, useState } from "react";

const NewIssue = () => {
  const [allCount, setAllCount] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const getJournalIssue = async (journalSlug) => {
        setLoading(true);
        const journalRes = await axios.get(`/journal/${journalSlug}`);
        const issue = journalRes.data?.issue;
        setAllCount((prev) => ({ ...prev, [journalSlug]: Number(issue) }));
        return issue;
      };
      await Promise.all(
        journals.map((journal) => getJournalIssue(slug(journal)))
      );
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleNewIssue = async (journalSlug) => {
    const journalRes = await axios.patch(`/journal/${journalSlug}`);
    const issue = journalRes.data.issue;
    setAllCount((prev) => ({ ...prev, [journalSlug]: Number(issue) }));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Call a New Issue</h1>

      <ul style={styles.list}>
        {journals.map((journal) => (
          <li key={journal} style={styles.listItem}>
            <strong>{journal}</strong>:
            <span style={styles.issue}>
              Current issue: {loading ? "Loading..." : allCount[slug(journal)]}
            </span>
            <button
              style={styles.button}
              onClick={() => handleNewIssue(slug(journal))}
              disabled={loading}
            >
              {loading
                ? "Issuing..."
                : `New issue (issue ${Number(allCount[slug(journal)]) + 1})`}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewIssue;

const styles = {
  container: {
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    marginBottom: "15px",
    background: "#f9f9f9",
    padding: "10px 15px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  issue: {
    marginLeft: "10px",
    marginRight: "20px",
    fontStyle: "italic",
  },
  button: {
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
