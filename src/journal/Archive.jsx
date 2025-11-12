import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/archive.css";
import JournalHeader from "./JournalHeader";
import ArchiveDetails from "../components/ArchiveDetails";

const Archive = () => {
  const { slug } = useParams();
  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`accepted/${slug}`);
        const { archive, manuscripts } = res.data;

        const groupedMap = {};

        // group existing manuscripts
        manuscripts.forEach((m) => {
          const vol = m.volume;
          const issue = m.issue;
          const year = 2024 + vol;
          const key = `${year} | Vol. ${vol} Issue ${issue}`;

          if (!groupedMap[key]) groupedMap[key] = { items: [], file: null };
          groupedMap[key].items.push(m);

          // attach the archive file for this volume/issue
          const archiveFile = archive.find(
            (a) => a.volume === vol && a.issue === issue
          );
          if (archiveFile) groupedMap[key].file = archiveFile.file;
        });

        // Add missing volume/issue placeholders
        const currentYear = new Date().getFullYear();
        const currentVol = currentYear - 2024; // e.g. 2025 → vol 1, 2026 → vol 2, etc.

        // Find all volume/issue combinations that exist in manuscripts or archive
        const existingCombos = new Set([
          ...manuscripts.map((m) => `${m.volume}-${m.issue}`),
          ...archive.map((a) => `${a.volume}-${a.issue}`),
        ]);

        // find the max issue per volume from manuscripts and archive
        const maxIssues = {};
        [...manuscripts, ...archive].forEach((m) => {
          if (!maxIssues[m.volume] || m.issue > maxIssues[m.volume])
            maxIssues[m.volume] = m.issue;
        });

        for (let vol = 1; vol <= currentVol; vol++) {
          const maxIssue = maxIssues[vol] || 1; // default to at least 1 issue
          for (let issue = 1; issue <= maxIssue; issue++) {
            const year = 2024 + vol;
            const key = `${year} | Vol. ${vol} Issue ${issue}`;

            if (!groupedMap[key]) {
              const archiveFile = archive.find(
                (a) => a.volume === vol && a.issue === issue
              );

              groupedMap[key] = {
                items: [],
                file: archiveFile ? archiveFile.file : null,
              };
            }
          }
        }

        // sort
        const sortedGroups = Object.entries(groupedMap)
          .map(([group, { items, file }]) => {
            const [yearText, volText] = group.split(" | ");
            const volNumber = parseInt(volText.split(" ")[1]);
            const issueNumber = parseInt(volText.split("Issue ")[1]);

            return {
              group,
              year: yearText,
              volume: volNumber,
              issue: issueNumber,
              items,
              file,
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

    fetchData();
  }, [slug]);

  return (
    <>
      <JournalHeader slug={slug} />
      <div className="archive">
        <h1>Journal Archive</h1>
        {loading && <p className="loading">Loading...</p>}
        {err && <p className="error">{err}</p>}
        {!grouped.length && <p>No items here</p>}
        {!loading &&
          !err &&
          grouped.map(({ group, items, file }) => (
            <div key={group} className="archive-group">
              <h2>{group}</h2>

              {file && <ArchiveDetails file={file} />}

              {items.length === 0 ? (
                <p className="empty">Nothing to show</p>
              ) : (
                <ul>
                  {items.map((m) => (
                    <li key={m._id}>
                      <h3>
                        {m.title} ({m.articleType || "Editorial"})
                      </h3>
                      ID: {m.customId}
                      <p
                        title={[
                          m.author,
                          ...m.coAuthors.map((a) => a.name),
                        ].join(", ")}
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
              )}
            </div>
          ))}
      </div>
    </>
  );
};

export default Archive;
