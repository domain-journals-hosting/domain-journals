import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";

const backendBase = import.meta.env.VITE_API_BASE_URL;

const ManuscriptView = () => {
  const { id } = useParams();
  const [manuscript, setManuscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const fetchManuscript = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/accepted/view/${id}`);
        setManuscript(res.data);
        setErrMsg("");
      } catch (err) {
        const msg = err.response?.data?.error || "Something went wrong";
        setErrMsg(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchManuscript();
  }, [id]);

  const downloadLink = (file) => {
    return file.endsWith(".doc")
      ? file
      : `${backendBase}/file?url=${encodeURIComponent(file)}`;
  };

  if (loading) return <p>Loading manuscript...</p>;
  if (errMsg) return <p style={{ color: "crimson" }}>{errMsg}</p>;
  if (!manuscript) return <p>No manuscript found.</p>;

  const authorsList = manuscript.authors?.length
    ? manuscript.authors.map((author, i) => (
        <li key={i}>
          {author.name} <small>({author.email})</small>
        </li>
      ))
    : [`(This is only for testing) ${manuscript.name}`];

  const file = manuscript.file;
  const previewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    file
  )}&embedded=true`;

  return (
    <div className="manuscript-view">
      <h1>{manuscript.title}</h1>
      <p className="meta">
        <strong>Journal:</strong> {manuscript.journal}
      </p>
      <p className="meta">
        <strong>Volume:</strong> {manuscript.volume} | <strong>Issue:</strong>{" "}
        {manuscript.issue}
      </p>

      <h2>Authors</h2>
      <ul className="authors-list">
        {authorsList.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>

      <h2>Abstract</h2>
      <p className="abstract">{manuscript.abstract}</p>

      <div className="actions">
        <a href={previewUrl} target="_blank" rel="noopener noreferrer">
          <button className="review-action-btn">View</button>
        </a>
        <a href={downloadLink(file)} download>
          <button className="review-action-btn">Download</button>
        </a>
      </div>
    </div>
  );
};

export default ManuscriptView;
