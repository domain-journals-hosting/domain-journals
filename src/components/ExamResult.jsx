import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { useEffect, useState } from "react";
import DisplayResult from "./DisplayResult";

const ExamResult = () => {
  const { examId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/result/single/${examId}`);
        console.log(res.data);
        setResult(res.data);
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to fetch result");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [examId]);

  if (loading) return <p>Loading result...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!result) return <p>No result found.</p>;

  return <DisplayResult result={result} />;
};
export default ExamResult;
