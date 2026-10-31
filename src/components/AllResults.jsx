import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaTrash, FaGraduationCap } from "react-icons/fa";
import axios from "../api/axios";
import DisplayResult from "./DisplayResult";

const AllResults = () => {
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get("id");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);

  const fetchAllResults = async () => {
    setLoading(true);
    let apiResults = [];

    try {
      const res = await axios.get("/result/all");
      apiResults = res.data || [];
    } catch (err) {
      console.warn("API results fetch skipped/failed:", err.message);
    }

    // Load local sample results
    const localSampleResults = JSON.parse(
      localStorage.getItem("sample_exam_results") || "[]",
    );

    const merged = [...localSampleResults, ...apiResults];
    setResults(merged);

    if (targetId) {
      const match = merged.find((r) => r._id === targetId);
      if (match) setSelectedResult(match);
      else if (merged.length > 0) setSelectedResult(merged[0]);
    } else if (merged.length > 0) {
      setSelectedResult(merged[0]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAllResults();
  }, [targetId]);

  const handleDeleteSample = (sampleId) => {
    const existing = JSON.parse(
      localStorage.getItem("sample_exam_results") || "[]",
    );
    const updated = existing.filter((r) => r._id !== sampleId);
    localStorage.setItem("sample_exam_results", JSON.stringify(updated));

    const updatedResults = results.filter((r) => r._id !== sampleId);
    setResults(updatedResults);

    if (selectedResult?._id === sampleId) {
      setSelectedResult(updatedResults[0] || null);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <p>Loading examination results...</p>
      </div>
    );
  if (error)
    return (
      <p className="error" style={{ margin: "20px" }}>
        {error}
      </p>
    );
  if (!results.length)
    return <p style={{ padding: "20px" }}>No examination results found.</p>;

  return (
    <div
      className="all-results-container"
      style={{ maxWidth: "800px", margin: "24px auto", padding: "0 16px" }}
    >
      <div
        className="results-selector-card"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <label
            htmlFor="result-select"
            style={{
              fontWeight: 700,
              color: "var(--color-teal-dark, #093238)",
              fontSize: "0.95rem",
            }}
          >
            Select Examination Result:
          </label>
          <select
            id="result-select"
            value={selectedResult?._id || ""}
            onChange={(e) =>
              setSelectedResult(results.find((r) => r._id === e.target.value))
            }
            style={{
              display: "block",
              marginTop: "6px",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "0.9rem",
              minWidth: "260px",
            }}
          >
            {results.map((r) => (
              <option key={r._id} value={r._id}>
                {r.isSample ? "[Practice Sample] " : ""}
                {r.exam?.description || "Examination"}
              </option>
            ))}
          </select>
        </div>

        {selectedResult?.isSample && (
          <button
            type="button"
            className="btn-sage-outline"
            onClick={() => handleDeleteSample(selectedResult._id)}
            style={{
              borderColor: "#ef4444",
              color: "#ef4444",
              padding: "6px 12px",
              fontSize: "0.82rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FaTrash /> Clear Sample Entry
          </button>
        )}
      </div>

      {selectedResult && <DisplayResult result={selectedResult} />}
    </div>
  );
};

export default AllResults;
