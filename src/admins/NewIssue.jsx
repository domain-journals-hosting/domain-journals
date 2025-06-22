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
              style={{
                ...styles.button,
                ...(loading ? { opacity: 0.6, cursor: "not-allowed" } : {}),
              }}
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
    padding: "30px 20px",
    maxWidth: "700px",
    margin: "0 auto",
    fontFamily: "Segoe UI, sans-serif",
    color: "#093238",
  },
  heading: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#093238",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    background: "#F1F8E9",
    padding: "16px 20px",
    borderRadius: "12px",
    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.08)",
  },
  issue: {
    margin: "0 20px",
    fontStyle: "italic",
    fontSize: "1rem",
    color: "#659377",
    fontWeight: "500",
  },
  button: {
    background: "#659377",
    color: "#F1F8E9",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
};
