import { useEffect, useState } from "react";
import axios from "../api/axios";
import ReviewActions from "./ReviewActions";
import journals from "../data/journals";

const STATUS_TABS = [
  { label: "Under Review", value: "under-review", color: "#FFA500" },
  { label: "Approved", value: "approved", color: "#4CAF50" },
  { label: "Paid", value: "paid", color: "#2196F3" },
  { label: "Rejected", value: "rejected", color: "#F44336" },
];

const ReviewManuscripts = () => {
  const [selectedValues, setSelectedValues] = useState({});
  console.log(selectedValues);

  const [manuscripts, setManuscripts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTab, setActiveTab] = useState("under-review");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const slug = (title) =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  const fetchManuscripts = async () => {
    try {
      const { data } = await axios.get("/manuscript", {
        withCredentials: true,
      });
      const manuscriptsWithStatus = data.map((m) => ({
        ...m,
        status: m.status || "under-review",
      }));
      setManuscripts(manuscriptsWithStatus);
      console.log(manuscriptsWithStatus);
      manuscriptsWithStatus.map((m) => {
        console.log(m);
        setSelectedValues((prev) => ({
          ...prev,
          [m._id]: {
            ...prev[m._id],
            journal: m.journal,
            issue: m.issue,
          },
        }));
      });
    } catch (err) {
      setError("Failed to load manuscripts. Please try refreshing.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchManuscripts();
  }, []);

  useEffect(() => {
    const filtered = manuscripts.filter((m) => m.status === activeTab);
    setFiltered(filtered);
  }, [activeTab, manuscripts]);

  if (loading) return <p>Loading manuscripts...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={styles.container}>
      <h2>Review Manuscripts</h2>
      <div style={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === tab.value ? tab.color : "#f0f0f0",
              color: activeTab === tab.value ? "white" : "#333",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p>No manuscripts in this category.</p>
      ) : (
        <ul style={styles.list}>
          {filtered.map((m) => {
            return (
              <li key={m._id} style={styles.card}>
                <h3>{m.title}</h3>
                <p>
                  <strong>Author:</strong> {m.name}
                </p>
                {m.status === "paid" ? (
                  <>
                    <label>Journal</label>
                    <select
                      value={selectedValues[m._id]?.journal || m.journal}
                      onChange={(e) =>
                        setSelectedValues((prev) => ({
                          ...prev,
                          [m._id]: {
                            ...prev[m._id],
                            journal: e.target.value,
                          },
                        }))
                      }
                    >
                      {journals.map((j) => (
                        <option key={slug(j)} value={slug(j)}>
                          {j}
                        </option>
                      ))}
                    </select>

                    <label>Issue</label>
                    <select
                      value={selectedValues[m._id]?.issue || m.issue}
                      onChange={(e) =>
                        setSelectedValues((prev) => ({
                          ...prev,
                          [m._id]: {
                            ...prev[m._id],
                            issue: Number(e.target.value),
                          },
                        }))
                      }
                    >
                      {Array.from(
                        { length: m.issue },
                        (_, i) => m.issue - i
                      ).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Volume:</strong> {m.volume}
                    </p>
                    <p>
                      <strong>Issue:</strong> {m.issue}
                    </p>
                  </>
                )}

                <p>
                  <strong>Abstract:</strong> {m.abstract}
                </p>

                <div className="actions" style={styles.actions}>
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
                  <ReviewActions
                    id={m._id}
                    status={m.status || "under-review"}
                    onUpdate={fetchManuscripts}
                    issue={selectedValues[m._id]?.issue || m.issue}
                    journal={selectedValues[m._id]?.journal || m.journal}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ReviewManuscripts;

const styles = {
  container: {
    padding: "20px",
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  tab: {
    border: "none",
    borderRadius: "20px",
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.3s",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  card: {
    background: "#fff",
    padding: "20px",
    marginBottom: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    flexWrap: "wrap",
  },
  select: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    minWidth: "180px",
    marginBottom: "10px",
  },
};
