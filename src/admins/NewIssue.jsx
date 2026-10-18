import journals, { slug } from "../data/journals";
import axios from "../api/axios";
import { useEffect, useState } from "react";

const NewIssue = () => {
  const [allCount, setAllCount] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [updatingSlug, setUpdatingSlug] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setInitialLoading(true);
      try {
        const requests = journals.map(async (journal) => {
          const journalSlug = slug(journal);
          const journalRes = await axios.get(`/journal/${journalSlug}`);
          const issue = Number(journalRes.data?.issue || 0);
          return { journalSlug, issue };
        });

        const results = await Promise.all(requests);

        const counts = {};
        const inputs = {};
        results.forEach(({ journalSlug, issue }) => {
          counts[journalSlug] = issue;
          inputs[journalSlug] = issue + 1; // Default input to current + 1
        });

        setAllCount(counts);
        setInputValues(inputs);
      } catch (error) {
        console.error("Error fetching journal issues:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleInputChange = (journalSlug, value) => {
    setInputValues((prev) => ({
      ...prev,
      [journalSlug]: value,
    }));
  };

  const handleNewIssue = async (journalSlug) => {
    const issueValue = inputValues[journalSlug];
    if (issueValue === "" || issueValue === undefined) return;

    setUpdatingSlug(journalSlug);
    try {
      const res = await axios.patch(`/journal/${journalSlug}`, {
        issue: Number(issueValue),
      });

      const updatedIssue = Number(res.data?.issue ?? issueValue);

      setAllCount((prev) => ({ ...prev, [journalSlug]: updatedIssue }));
      setInputValues((prev) => ({ ...prev, [journalSlug]: updatedIssue + 1 }));
    } catch (error) {
      console.error("Error updating issue:", error);
    } finally {
      setUpdatingSlug(null);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.heading}>Manage Journal Issues</h1>
        <p style={styles.subheading}>
          Update or call new issues across all journals
        </p>
      </header>

      {initialLoading ? (
        <div style={styles.loaderContainer}>
          <span style={styles.loaderText}>Loading journals...</span>
        </div>
      ) : (
        <div style={styles.grid}>
          {journals.map((journal) => {
            const currentSlug = slug(journal);
            const isUpdating = updatingSlug === currentSlug;
            const currentIssue = allCount[currentSlug];

            return (
              <div key={journal} style={styles.card}>
                <div style={styles.cardInfo}>
                  <h3 style={styles.journalTitle}>{journal}</h3>
                  <div style={styles.badge}>
                    Current Issue: <strong>{currentIssue ?? "N/A"}</strong>
                  </div>
                </div>

                <div style={styles.cardActions}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>New Issue #</label>
                    <input
                      type="number"
                      min="1"
                      style={styles.input}
                      value={inputValues[currentSlug] ?? ""}
                      onChange={(e) =>
                        handleInputChange(currentSlug, e.target.value)
                      }
                      placeholder="Issue #"
                    />
                  </div>

                  <button
                    style={{
                      ...styles.button,
                      ...(isUpdating ? styles.buttonDisabled : {}),
                    }}
                    onClick={() => handleNewIssue(currentSlug)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update Issue"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NewIssue;

const styles = {
  container: {
    padding: "40px 20px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: "#093238",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  heading: {
    margin: "0 0 8px 0",
    fontSize: "2rem",
    fontWeight: "700",
    color: "#093238",
  },
  subheading: {
    margin: 0,
    fontSize: "1rem",
    color: "#546E7A",
  },
  loaderContainer: {
    textAlign: "center",
    padding: "40px 0",
  },
  loaderText: {
    fontSize: "1.1rem",
    color: "#659377",
    fontWeight: "600",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    background: "#FFFFFF",
    borderRadius: "12px",
    padding: "20px 24px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    boxShadow: "0 4px 12px rgba(9, 50, 56, 0.06)",
    border: "1px solid #E0E7FF",
  },
  cardInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: "1 1 240px",
  },
  journalTitle: {
    margin: 0,
    fontSize: "1.15rem",
    fontWeight: "600",
    color: "#093238",
  },
  badge: {
    display: "inline-block",
    fontSize: "0.875rem",
    color: "#455A64",
    backgroundColor: "#F1F8E9",
    padding: "4px 10px",
    borderRadius: "6px",
    width: "fit-content",
  },
  cardActions: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#546E7A",
    textTransform: "uppercase",
  },
  input: {
    width: "90px",
    padding: "8px 12px",
    fontSize: "0.95rem",
    borderRadius: "8px",
    border: "1px solid #CFD8DC",
    outline: "none",
    color: "#093238",
    fontWeight: "600",
    textAlign: "center",
  },
  button: {
    background: "#659377",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "background 0.2s ease, opacity 0.2s ease",
    height: "38px",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};
