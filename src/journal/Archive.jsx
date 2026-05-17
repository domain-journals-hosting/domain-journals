import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/archive.css";
import JournalHeader from "./JournalHeader";
import ArchiveDetails from "../components/ArchiveDetails";
import journals from "../data/journals";
import { Helmet } from "react-helmet";

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
          const { year, issue } = m;
          const vol = yearToVol[year];
          const key = `${year} | Vol. ${vol} Issue ${issue}`;
          if (!groupedMap[key])
            groupedMap[key] = { items: [], file: null, year, vol, issue };
          groupedMap[key].items.push(m);
          const archiveFile = archive.find(
            (a) => a.year === year && a.issue === issue,
          );
          if (archiveFile) {
            groupedMap[key].file = archiveFile.file;
            groupedMap[key].fileUrl = archiveFile.fileUrl;
          }
        });

        archive.forEach((a) => {
          const { year, issue } = a;
          const vol = yearToVol[year];
          const key = `${year} | Vol. ${vol} Issue ${issue}`;
          if (!groupedMap[key]) {
            groupedMap[key] = {
              items: [],
              file: a.file,
              fileUrl: a.fileUrl,
              year,
              vol,
              issue,
            };
          }
        });

        const sortedGroups = Object.entries(groupedMap)
          .map(([group, { items, file, fileUrl, year, vol, issue }]) => ({
            group,
            year,
            volume: vol,
            issue,
            items,
            file,
            fileUrl,
          }))
          .sort((a, b) => {
            if (a.volume !== b.volume) return b.volume - a.volume;
            return b.issue - a.issue;
          })
          .filter((g) => g.issue > 0);

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

  const journal = journals.find((j) => j.slug === slug);
  const journalTitle = journal?.title || "Journal";

  return (
    <>
      <Helmet>
        <title>{journalTitle} Archive - Domain Journals</title>
        <meta
          name="description"
          content={`Browse the archive of published issues and articles from ${journalTitle}.`}
        />
        <link
          rel="canonical"
          href={`https://www.domainjournals.com/journals/${slug}/archive`}
        />
      </Helmet>

      <JournalHeader slug={slug} />

      <div className="archive-page">
        <h1>Journal Archive</h1>

        {loading && <p className="archive__status">Loading...</p>}
        {err && <p className="archive__error">{err}</p>}
        {!loading && !err && grouped.length === 0 && (
          <p className="archive__status">No archived issues yet.</p>
        )}

        {!loading &&
          !err &&
          grouped.map(({ group, items, file, fileUrl }) => (
            <div key={group} className="archive-group">
              <h2 className="archive-group__title">{group}</h2>

              {file && <ArchiveDetails file={file} fileUrl={fileUrl} />}

              {items.length === 0 ? (
                <p className="archive-group__empty">
                  No articles in this issue.
                </p>
              ) : (
                <ul className="archive-list">
                  {items.map((m) => {
                    const names = [m.author, ...m.coAuthors.map((a) => a.name)];
                    const authorsDisplay =
                      names.length > 10
                        ? `${m.author.trim().split(" ").slice(-1)[0]} et al.`
                        : names.join(", ");
                    return (
                      <li key={m._id} className="archive-item">
                        <div className="archive-item__meta">
                          <span className="archive-item__type">
                            {m.articleType || "Editorial"}
                          </span>
                        </div>
                        <h3 className="archive-item__title">{m.title}</h3>
                        <p className="archive-item__id">ID: {m.customId}</p>
                        <p
                          className="archive-item__authors"
                          title={names.join(", ")}
                        >
                          <span>Author(s):</span> {authorsDisplay}
                        </p>
                        <div className="archive-item__actions">
                          <Link to="/view" state={{ manuscript: m }}>
                            <button className="btn-outline">
                              View Abstract
                            </button>
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
      </div>
    </>
  );
};

export default Archive;
