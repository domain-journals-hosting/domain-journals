import { useMemo } from "react";
import { parseStoredContent, stripRefMarker } from "../utils/articleContent";
import "../styles/articleContent.css";

// Matches [1], [1,2], [1, 3], [1–3]
const CITE_RE = /\[(\d{1,3}(?:\s*[,–-]\s*\d{1,3})*)\]/g;

// Numeric-looking cells (and columns made only of them) are right-aligned
const NUMERIC_RE = /^[-+\u2212]?\d[\d,]*(\.\d+)?%?$/;

/** Turns "[1, 2]" in text into links to #ref-1 / #ref-2 (only for references that exist). */
const withCitations = (text, refCount) => {
  if (!refCount) return text;
  const out = [];
  let last = 0;
  let m;
  CITE_RE.lastIndex = 0;
  while ((m = CITE_RE.exec(text))) {
    out.push(text.slice(last, m.index));
    out.push(
      <span key={m.index}>
        [
        {m[1].split(/(\s*[,–-]\s*)/).map((part, i) =>
          /^\d+$/.test(part) && Number(part) <= refCount ? (
            <a key={i} href={`#ref-${part}`} className="citation-link">
              {part}
            </a>
          ) : (
            part
          ),
        )}
        ]
      </span>,
    );
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
};

/**
 * Renders stored article content.
 *  - JSON content  -> sections, blocks, citations, references
 *  - legacy string -> plain paragraphs (HTML is only rendered if `legacyHtml` is set;
 *                     enable it only once the backend sanitizes content).
 */
const ArticleContent = ({ content, legacyHtml = false }) => {
  const data = useMemo(() => parseStoredContent(content), [content]);

  if (!content) return null;

  if (!data) {
    const raw = String(content);
    if (legacyHtml && /<\/?[a-z][\s\S]*>/i.test(raw)) {
      return (
        <div
          className="article-content article-legacy"
          dangerouslySetInnerHTML={{ __html: raw }}
        />
      );
    }
    return (
      <div className="article-content article-legacy">
        {raw.split(/\n{2,}/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    );
  }

  const { sections, references } = data;

  return (
    <div className="article-content">
      {sections.map((sec, i) => {
        const Heading = sec.level > 1 ? "h3" : "h2";
        return (
          <section key={i} className="article-section">
            {sec.heading && <Heading>{sec.heading}</Heading>}
            {sec.blocks.map((b, j) => {
              if (b.type === "quote") {
                return (
                  <blockquote key={j} className="journal-quote">
                    {withCitations(b.text, references.length)}
                  </blockquote>
                );
              }
              if (b.type === "table") {
                const hasHead = b.headers.some(Boolean);
                const numeric = b.headers.map((_, c) => {
                  const vals = b.rows.map((r) => r[c]).filter(Boolean);
                  return (
                    vals.length > 0 && vals.every((v) => NUMERIC_RE.test(v))
                  );
                });
                return (
                  <div key={j} className="article-table">
                    <div className="article-table-scroll">
                      <table>
                        {b.caption && <caption>{b.caption}</caption>}
                        {hasHead && (
                          <thead>
                            <tr>
                              {b.headers.map((h, c) => (
                                <th
                                  key={c}
                                  scope="col"
                                  className={numeric[c] ? "num" : undefined}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                        )}
                        <tbody>
                          {b.rows.map((row, r) => (
                            <tr key={r}>
                              {row.map((cell, c) => (
                                <td
                                  key={c}
                                  className={numeric[c] ? "num" : undefined}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }
              if (b.type === "figure") {
                if (!b.url) return null;
                return (
                  <figure key={j} className="article-figure">
                    <img
                      src={b.url}
                      alt={b.caption || "Figure"}
                      loading="lazy"
                    />
                    {b.caption && <figcaption>{b.caption}</figcaption>}
                  </figure>
                );
              }
              return <p key={j}>{withCitations(b.text, references.length)}</p>;
            })}
          </section>
        );
      })}

      {references.length > 0 && (
        <section className="article-references">
          <h2>References</h2>
          <ol>
            {references.map((ref, i) => (
              <li key={i} id={`ref-${i + 1}`}>
                <span className="ref-num">[{i + 1}]</span> {stripRefMarker(ref)}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
};

export default ArticleContent;
