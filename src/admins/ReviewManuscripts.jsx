import { useEffect, useState } from "react";
import axios from "../api/axios";
import { slug } from "../data/journals";
import ReviewActions from "./ReviewActions";
import journals from "../data/journals";
import { FaFileAlt, FaDownload, FaEye, FaUser, FaGlobe } from "react-icons/fa";
import "../styles/reviewManuscripts.css";
import { useUser } from "../hooks/useUser";

const backendBase = import.meta.env.VITE_API_BASE_URL;

const downloadLink = (file) => {
  return file.endsWith(".doc")
    ? file
    : `${backendBase}/file?url=${encodeURIComponent(file)}`;
};

// Expandable Abstract Component with smooth inline expansion
const TruncatedAbstract = ({ text, maxLength = 220 }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;
  if (text.length <= maxLength) return <span>{text}</span>;

  return (
    <span className="abstract-text">
      {expanded ? text : `${text.slice(0, maxLength)}... `}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="read-more-toggle"
      >
        {expanded ? "Show less" : "Read full abstract"}
      </button>
    </span>
  );
};

const ReviewManuscripts = () => {
  const { user } = useUser();
  const role = user?.role;

  const getStatusTabs = () => {
    const tabs = [
      { label: "Under Review", value: "under-review" },
      { label: "Approved", value: "approved" },
      { label: "Paid", value: "paid" },
      { label: "Published", value: "published" },
      { label: "Rejected", value: "rejected" },
    ];

    if (role === "admin") {
      tabs.unshift({
        label: "Screening",
        value: "screening",
      });
    }

    return tabs;
  };

  const STATUS_TABS = getStatusTabs();
  const [selectedValues, setSelectedValues] = useState({});
  const [manuscripts, setManuscripts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTab, setActiveTab] = useState("under-review");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchManuscripts = async () => {
    try {
      const { data } = await axios.get("/manuscript", {
        withCredentials: true,
      });

      const { data: acceptedData } = await axios.get("/accepted/all", {
        withCredentials: true,
      });

      const manuscriptsWithStatus = data.map((m) => ({
        ...m,
        status: m.status || "under-review",
      }));

      acceptedData.forEach((m) => {
        manuscriptsWithStatus.push({
          ...m,
          status: "published",
        });
      });

      setManuscripts(manuscriptsWithStatus);

      manuscriptsWithStatus.forEach((m) => {
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

  if (loading)
    return (
      <div className="status-container">
        <p>Loading manuscripts...</p>
      </div>
    );

  if (error)
    return (
      <div className="status-container error">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="review-page-container">
      <div className="review-page-header">
        <h2>Manuscript Management</h2>
        <span className="count-badge">{filtered.length} Items</span>
      </div>

      {/* Tabs */}
      <div className="review-tabs-bar">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`tab-btn ${activeTab === tab.value ? "active" : ""}`}
            data-status={tab.value}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Manuscript List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <FaFileAlt className="empty-icon" />
          <p>No manuscripts in this category.</p>
        </div>
      ) : (
        <div className="review-cards-list">
          {filtered.map((m) => {
            const coAuthorsList = Array.isArray(m.coAuthors)
              ? m.coAuthors.map((a) => a.name).filter(Boolean)
              : [];
            const allAuthorNames = [m.author, ...coAuthorsList].join(", ");

            return (
              <div key={m._id} className="manuscript-card">
                {/* ZONE 1: HEADER & TITLE */}
                <div className="card-zone-header">
                  <div className="title-row">
                    <h3 className="manuscript-title">{m.title}</h3>
                    {m.customId && (
                      <span className="custom-id-chip">{m.customId}</span>
                    )}
                  </div>

                  <div className="author-meta-row">
                    <span className="author-item">
                      <FaUser className="meta-icon" />
                      <strong>Main Author:</strong> {m.author} ({m.email})
                    </span>
                    {coAuthorsList.length > 0 && (
                      <span className="coauthors-tag">
                        +{coAuthorsList.length} Co-Author
                        {coAuthorsList.length > 1 ? "s" : ""}:{" "}
                        {coAuthorsList.join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* ZONE 2: METADATA PILLS & CONFIG */}
                <div className="card-zone-meta">
                  {m.status === "paid" ? (
                    <div className="paid-selectors-group">
                      <div className="select-pill">
                        <label>Target Journal:</label>
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
                      </div>

                      <div className="select-pill">
                        <label>Issue No:</label>
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
                            { length: m.issue || 1 },
                            (_, i) => (m.issue || 1) - i,
                          ).map((n) => (
                            <option key={n} value={n}>
                              Issue {n}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="meta-badges-row">
                      <span className="meta-chip journal">
                        <strong>Journal:</strong> {m.journal}
                      </span>
                      <span className="meta-chip issue">
                        <strong>Issue:</strong> {m.issue}
                      </span>
                      {m.articleType && (
                        <span className="meta-chip type">
                          <strong>Type:</strong> {m.articleType}
                        </span>
                      )}
                      {m.country && (
                        <span className="meta-chip country">
                          <FaGlobe className="chip-icon" /> {m.country}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* ZONE 3: ABSTRACT BODY */}
                <div className="card-zone-body">
                  <p className="abstract-paragraph">
                    <strong>Abstract:</strong>{" "}
                    <TruncatedAbstract text={m.abstract} maxLength={200} />
                  </p>
                </div>

                {/* ZONE 4: FOOTER ACTIONS TOOLBAR */}
                <div className="card-zone-footer">
                  <div className="file-actions-group">
                    <a
                      href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                        m.file,
                      )}&embedded=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-file-action view"
                    >
                      <FaEye /> View
                    </a>
                    <a
                      href={downloadLink(m.file)}
                      download
                      className="btn-file-action download"
                    >
                      <FaDownload /> Download
                    </a>
                  </div>

                  <div className="workflow-actions-group">
                    <ReviewActions
                      id={m._id}
                      manuscript={m}
                      edited={m.edited}
                      status={m.status || "under-review"}
                      onUpdate={fetchManuscripts}
                      issue={selectedValues[m._id]?.issue || m.issue}
                      journal={selectedValues[m._id]?.journal || m.journal}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewManuscripts;
