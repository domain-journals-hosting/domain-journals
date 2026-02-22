import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { useEffect, useState } from "react";
import DisplayResult from "./DisplayResult";

const AllResults = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState("");

  useEffect(() => {
    if (results && results.length > 0) {
      setSelectedResult(results[0]);
    }
  }, [results]);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/result/all`);
        console.log(res.data);
        setResults(res.data);
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to fetch result");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, []);

  if (loading) return <p>Loading result...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!results.length) return <p>No result found.</p>;

  const select = (
    <>
      <label htmlFor="result">Select result: </label>
      <select
        value={selectedResult?._id || ""}
        onChange={(e) =>
          setSelectedResult(results.find((r) => r._id === e.target.value))
        }
        name=""
        id="result"
      >
        {results.map((r) => (
          <option key={r._id} value={r._id}>
            {r.exam.description || "Exam"}
          </option>
        ))}
      </select>
    </>
  );
  const content = (
    <div>
      <br />
      {select}
      <DisplayResult result={selectedResult} />
    </div>
  );
  return content;
};
export default AllResults;
