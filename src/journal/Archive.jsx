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

        // derive volume ranking from distinct years across both collections
        const allYears = [
          ...new Set([
            ...manuscripts.map((m) => m.year),
            ...archive.map((a) => a.year),
          ]),
        ]
          .filter(Boolean)
          .sort((a, b) => a - b);

        const yearToVol = {};
        allYears.forEach((y, i) => (yearToVol[y] = i + 1));

        const groupedMap = {};

        manuscripts.forEach((m) => {
          const year = m.year;
          const issue = m.issue;
          const vol = yearToVol[year];
          const key = `${year} | Vol. ${vol} Issue ${issue}`;

          if (!groupedMap[key])
            groupedMap[key] = { items: [], file: null, year, vol, issue };
          groupedMap[key].items.push(m);

          // match archive file by year + issue
          const archiveFile = archive.find(
            (a) => a.year === year && a.issue === issue,
          );
          if (archiveFile) groupedMap[key].file = archiveFile.file;
        });

        // placeholders for archive entries with no manuscripts
        archive.forEach((a) => {
          const year = a.year;
          const issue = a.issue;
          const vol = yearToVol[year];
          const key = `${year} | Vol. ${vol} Issue ${issue}`;

          if (!groupedMap[key]) {
            groupedMap[key] = { items: [], file: a.file, year, vol, issue };
          }
        });

        const sortedGroups = Object.entries(groupedMap)
          .map(([group, { items, file, year, vol, issue }]) => ({
            group,
            year,
            volume: vol,
            issue,
            items,
            file,
          }))
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
