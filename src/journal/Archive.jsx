import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/archive.css";
import JournalHeader from "./JournalHeader";

const Archive = () => {
  const { slug } = useParams();
  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const backendBase = import.meta.env.VITE_API_BASE_URL;
  const downloadLink = (file) => {
    console.log(file);
    return file.endsWith(".doc")
      ? file
      : `${backendBase}/file?url=${encodeURIComponent(file)}`;
  };

  useEffect(() => {
    const fetchManuscripts = async () => {
      try {
        const res = await axios.get(`accepted/${slug}`);
        const manuscripts = res.data;

        const groupedMap = {};

        manuscripts.forEach((m) => {
          const vol = m.volume;
          const issue = m.issue;
          const year = 2024 + vol;
          const key = `${year} | Vol. ${vol} Issue ${issue}`;

          if (!groupedMap[key]) groupedMap[key] = [];

          groupedMap[key].push(m);
        });

        const sortedGroups = Object.entries(groupedMap)
          .map(([group, items]) => {
            const [yearText, volText] = group.split(" | ");
            const volNumber = parseInt(volText.split(" ")[1]);
            const issueNumber = parseInt(volText.split("Issue ")[1]);

            return {
              group,
              year: yearText,
              volume: volNumber,
              issue: issueNumber,
              items,
            };
          })
          .sort((a, b) => {
            if (a.volume !== b.volume) return b.volume - a.volume;
            return b.issue - a.issue;
          });

        setGrouped(sortedGroups);
      } catch (error) {
        console.error(error);
        setErr("Failed to load archive.");
      } finally {
        setLoading(false);
      }
    };

    fetchManuscripts();
  }, [slug]);

  return (
    <>
      <JournalHeader slug={slug} />
      <div className="archive">
        <h1>Journal Archive</h1>
        {loading && <p>Loading...</p>}
        {err && <p className="error">{err}</p>}
        {!grouped.length && <p>No items here</p>}
        {!loading &&
          !err &&
          grouped.map(({ group, items }) => (
            <div key={group} className="archive-group">
              <h2>{group}</h2>
              <ul>
                {items.map((m) => (
                  <li key={m._id}>
                    <h3>{m.title}</h3>
                    <p
                      title={[m.author, ...m.coAuthors.map((a) => a.name)].join(
                        ", "
                      )}
                    >
                      <strong>Author(s):</strong>{" "}
                      {(() => {
                        const names = [
                          m.author,
                          ...m.coAuthors.map((a) => a.name),
                        ].join(", ");
                        return names.length > 100
                          ? names.slice(0, 97) + "..."
                          : names;
                      })()}
                    </p>

                    <div className="actions">
                      <Link to="/view" state={{ manuscript: m }}>
                        <button>📄 View Abstract</button>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </>
  );
};

export default Archive;
