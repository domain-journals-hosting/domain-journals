import { useEffect, useState } from "react";
import axios from "../api/axios";

const ReviewManuscripts = () => {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchManuscripts = async () => {
      try {
        const { data } = await axios.get("/manuscript", {
          withCredentials: true,
        });
        setManuscripts(data);
      } catch (err) {
        setError("Failed to load manuscripts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchManuscripts();
  }, []);

  if (loading) return <p>Loading manuscripts...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Review Manuscripts</h2>
      {manuscripts.length === 0 ? (
        <p>No manuscripts found.</p>
      ) : (
        <ul>
          {manuscripts.map((m) => (
            <li key={m._id} style={{ padding: "10px" }}>
              <h3>{m.title}</h3>

              <p>
                <strong>Author:</strong> {m.name}
              </p>
              <p>
                <strong>Volume:</strong> {m.volume}
              </p>
              <p>
                <strong>Issue:</strong> {m.issue}
              </p>
              <p>
                <strong>Abstract:</strong> {m.abstract}
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
                <a href={`${m.file}`} download>
                  <button>Download</button>
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReviewManuscripts;
