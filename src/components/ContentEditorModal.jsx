import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FaTimes,
  FaMagic,
  FaCopy,
  FaCheck,
  FaPlus,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaImage,
  FaQuoteLeft,
  FaParagraph,
  FaCode,
  FaList,
  FaTable,
  FaExternalLinkAlt,
} from "react-icons/fa";
import axios from "../api/axios";
import {
  generateAiPrompt,
  parseAiJson,
  parseStoredContent,
  stripRefMarker,
  blockHasContent,
} from "../utils/articleContent";
import { getViewerUrl } from "../utils/fileHelpers";
import "../styles/contentEditorModal.css";

/* ------------------------------ helpers ------------------------------ */
let counter = 0;
const uid = () => `k${Date.now().toString(36)}${(counter++).toString(36)}`;

const BLANK = {
  title: "",
  sections: [
    {
      heading: "1. Introduction",
      level: 1,
      blocks: [{ type: "paragraph", text: "" }],
    },
  ],
  references: [],
};

/** Content JSON -> editor state (adds stable ids so React keys survive reordering). */
const hydrate = (data) => ({
  title: data.title || "",
  sections: data.sections.map((s) => ({
    id: uid(),
    heading: s.heading,
    level: s.level || 1,
    blocks: s.blocks.map((b) => ({ ...b, id: uid() })),
  })),
  references: data.references.map((r) => ({
    id: uid(),
    text: stripRefMarker(r),
  })),
});

const moveIn = (arr, id, dir) => {
  const i = arr.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
};

const rowsFor = (text = "", min = 3) =>
  Math.min(14, Math.max(min, Math.ceil(text.length / 105)));

const IconBtn = ({ onClick, disabled, title, danger, children }) => (
  <button
    type="button"
    className={`cem-icon-btn${danger ? " cem-danger" : ""}`}
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
  >
    {children}
  </button>
);

/* ------------------------------ component ------------------------------ */
const ContentEditorModal = ({
  isOpen,
  onClose,
  fileUrl,
  initialContent,
  onSave,
  startPage: initialStart = 1,
  endPage: initialEnd = "",
}) => {
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState([]);
  const [references, setReferences] = useState([]);

  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadingId, setUploadingId] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [rawJsonMode, setRawJsonMode] = useState(false);
  const [rawJsonText, setRawJsonText] = useState("");
  const [error, setError] = useState("");

  // Latest props, read only when the modal opens (so parent re-renders never wipe edits)
  const latest = useRef({});
  latest.current = { initialContent, initialStart, initialEnd };

  const applyData = (data) => {
    const h = hydrate(data);
    setTitle(h.title);
    setSections(h.sections);
    setReferences(h.references);
  };

  useEffect(() => {
    if (!isOpen) return;
    const {
      initialContent: content,
      initialStart: s,
      initialEnd: e,
    } = latest.current;

    let data = parseStoredContent(content);
    if (!data && typeof content === "string" && content.trim()) {
      // Legacy plain text / HTML article
      data = {
        title: "",
        sections: [
          {
            heading: "Main Content",
            level: 1,
            blocks: [{ type: "paragraph", text: content }],
          },
        ],
        references: [],
      };
    }
    applyData(data || BLANK);

    setStartPage(String(s || 1));
    setEndPage(e ? String(e) : "");
    setRawJsonMode(false);
    setRawJsonText("");
    setError("");
    setCopiedPrompt(false);
    setProgress(0);
  }, [isOpen]);

  // Lock page scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  /* ---------------------------- serialization ---------------------------- */
  const serialize = (prune) => {
    const clean = (b) =>
      prune && b.type === "table"
        ? { ...b, rows: b.rows.filter((r) => r.some((c) => c.trim())) }
        : b;

    let secs = sections.map(({ heading, level, blocks }) => ({
      heading,
      level,
      blocks: blocks
        .map(({ id, ...b }) => clean(b))
        .filter((b) => !prune || blockHasContent(b)),
    }));
    if (prune) secs = secs.filter((s) => s.heading.trim() || s.blocks.length);

    const refs = references.map((r) => (prune ? r.text.trim() : r.text));
    return {
      ...(title.trim() ? { title: title.trim() } : {}),
      sections: secs,
      references: prune ? refs.filter(Boolean) : refs,
    };
  };

  const hasContent = () =>
    sections.some((s) => s.blocks.some(blockHasContent)) ||
    references.some((r) => r.text.trim());

  /* ------------------------------ extraction ------------------------------ */
  const handleAutoExtract = async () => {
    if (!fileUrl) return setError("No manuscript PDF file URL found.");

    const s = parseInt(startPage, 10) || 1;
    const e = endPage ? parseInt(endPage, 10) : null;
    if (e && e < s)
      return setError(
        "End page must be greater than or equal to the start page.",
      );

    if (
      hasContent() &&
      !window.confirm(
        "Replace the current content with text extracted from the PDF? Uploaded figures will be removed.",
      )
    )
      return;

    setExtracting(true);
    setProgress(0);
    setError("");
    try {
      // Loaded on demand so pdf.js never lands in the main bundle
      const { extractPdfContent } = await import("../utils/pdfParser");
      const data = await extractPdfContent(fileUrl, s, e, {
        onProgress: (p) => setProgress(Math.round(p * 100)),
      });
      applyData(data);
    } catch (err) {
      setError(err.message || "Failed to parse PDF.");
    } finally {
      setExtracting(false);
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generateAiPrompt());
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      setError("Could not access the clipboard. Please copy manually.");
    }
  };

  /* ------------------------------- JSON mode ------------------------------- */
  const toggleRawMode = () => {
    if (!rawJsonMode) setRawJsonText(JSON.stringify(serialize(false), null, 2)); // always from live edits
    setRawJsonMode((m) => !m);
    setError("");
  };

  const handleApplyRawJson = () => {
    try {
      applyData(parseAiJson(rawJsonText));
      setRawJsonMode(false);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  /* ------------------------------- sections ------------------------------- */
  const patchSection = (sid, patch) =>
    setSections((p) => p.map((s) => (s.id === sid ? { ...s, ...patch } : s)));

  const addSection = () =>
    setSections((p) => [
      ...p,
      { id: uid(), heading: "New Section", level: 1, blocks: [] },
    ]);

  const removeSection = (sec) => {
    if (
      sec.blocks.length &&
      !window.confirm(
        `Delete "${sec.heading || "this section"}" and its ${sec.blocks.length} block(s)?`,
      )
    )
      return;
    setSections((p) => p.filter((s) => s.id !== sec.id));
  };

  const moveSection = (sid, dir) => setSections((p) => moveIn(p, sid, dir));

  /* -------------------------------- blocks -------------------------------- */
  const addBlock = (sid, type) => {
    const block =
      type === "figure"
        ? { id: uid(), type, url: "", caption: "" }
        : type === "table"
          ? {
              id: uid(),
              type,
              caption: "",
              headers: ["", "", ""],
              rows: [
                ["", "", ""],
                ["", "", ""],
              ],
            }
          : { id: uid(), type, text: "" };
    setSections((p) =>
      p.map((s) => (s.id === sid ? { ...s, blocks: [...s.blocks, block] } : s)),
    );
  };

  const patchBlock = (sid, bid, patch) =>
    setSections((p) =>
      p.map((s) =>
        s.id !== sid
          ? s
          : {
              ...s,
              blocks: s.blocks.map((b) =>
                b.id === bid ? { ...b, ...patch } : b,
              ),
            },
      ),
    );

  const removeBlock = (sid, bid) =>
    setSections((p) =>
      p.map((s) =>
        s.id === sid
          ? { ...s, blocks: s.blocks.filter((b) => b.id !== bid) }
          : s,
      ),
    );

  const moveBlock = (sid, bid, dir) =>
    setSections((p) =>
      p.map((s) =>
        s.id === sid ? { ...s, blocks: moveIn(s.blocks, bid, dir) } : s,
      ),
    );

  // Table editing. The grid is [headers, ...rows]; fn receives a deep copy and returns the new grid.
  const updateTable = (sid, bid, fn) =>
    setSections((p) =>
      p.map((s) =>
        s.id !== sid
          ? s
          : {
              ...s,
              blocks: s.blocks.map((b) => {
                if (b.id !== bid) return b;
                const grid = fn([b.headers, ...b.rows].map((r) => [...r]));
                return { ...b, headers: grid[0], rows: grid.slice(1) };
              }),
            },
      ),
    );

  const setCell = (sid, bid, r, c, v) =>
    updateTable(sid, bid, (g) => {
      g[r][c] = v;
      return g;
    });
  const addRow = (sid, bid) =>
    updateTable(sid, bid, (g) => [...g, Array(g[0].length).fill("")]);
  const removeRow = (sid, bid, r) =>
    updateTable(sid, bid, (g) =>
      g.length > 2 && r > 0 ? g.filter((_, i) => i !== r) : g,
    );
  const addCol = (sid, bid) =>
    updateTable(sid, bid, (g) => g.map((row) => [...row, ""]));
  const removeCol = (sid, bid, c) =>
    updateTable(sid, bid, (g) =>
      g[0].length > 1 ? g.map((row) => row.filter((_, i) => i !== c)) : g,
    );

  // Paste cells copied from Excel / Sheets / Word (tab- and newline-separated) into the grid
  const handleCellPaste = (e, sid, bid, r, c) => {
    const text = e.clipboardData.getData("text");
    if (!/[\t\n]/.test(text)) return; // single value: let the browser paste normally
    e.preventDefault();
    updateTable(sid, bid, (g) => {
      const data = text
        .replace(/\r/g, "")
        .replace(/\n+$/, "")
        .split("\n")
        .map((line) => line.split("\t"));
      const needRows = r + data.length;
      const needCols = Math.max(
        g[0].length,
        c + data.reduce((m, d) => Math.max(m, d.length), 0),
      );
      const grid = g.map((row) => [
        ...row,
        ...Array(needCols - row.length).fill(""),
      ]);
      while (grid.length < needRows) grid.push(Array(needCols).fill(""));
      data.forEach((line, i) =>
        line.forEach((cell, j) => {
          grid[r + i][c + j] = cell.trim();
        }),
      );
      return grid;
    });
  };

  const handleImageUpload = async (e, sid, bid) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.append("figure", file);

    setUploadingId(bid);
    setError("");
    try {
      const { data } = await axios.post("/file/figure", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      patchBlock(sid, bid, { url: data.url }); // functional update: safe even if the user kept typing
    } catch {
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingId(null);
    }
  };

  /* ------------------------------ references ------------------------------ */
  const addReference = () =>
    setReferences((p) => [...p, { id: uid(), text: "" }]);
  const updateReference = (id, text) =>
    setReferences((p) => p.map((r) => (r.id === id ? { ...r, text } : r)));
  const removeReference = (id) =>
    setReferences((p) => p.filter((r) => r.id !== id));
  const moveReference = (id, dir) => setReferences((p) => moveIn(p, id, dir));

  /* --------------------------------- save --------------------------------- */
  const handleFinalSave = () => {
    onSave(JSON.stringify(serialize(true)));
    onClose();
  };

  /* --------------------------------- view --------------------------------- */
  // Cloudinary raw PDFs have no extension in their URL; Word files keep .doc/.docx
  const isWordFile = !!fileUrl && /\.docx?(\?|#|$)/i.test(fileUrl);

  return createPortal(
    <div className="cem-overlay">
      <div
        className="cem-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Article content editor"
      >
        <header className="cem-header">
          <h2>Article Content Editor</h2>
          <button
            type="button"
            className="cem-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </header>

        {error && (
          <div className="cem-error" role="alert">
            {error}
          </div>
        )}

        {isWordFile && (
          <div className="cem-notice">
            This looks like a Word file. Auto-extract only works with PDFs, so
            use the AI prompt instead.
          </div>
        )}

        <div className="cem-toolbar">
          <div className="cem-range">
            <label htmlFor="cem-start">Pages</label>
            <input
              id="cem-start"
              type="number"
              min="1"
              value={startPage}
              onChange={(e) => setStartPage(e.target.value)}
              placeholder="Start"
              className="cem-page-input"
            />
            <span>to</span>
            <input
              type="number"
              min="1"
              value={endPage}
              onChange={(e) => setEndPage(e.target.value)}
              placeholder="End"
              aria-label="End page"
              className="cem-page-input"
            />
            <button
              type="button"
              className="cem-btn cem-btn--primary cem-btn--sm"
              onClick={handleAutoExtract}
              disabled={extracting}
            >
              <FaMagic />{" "}
              {extracting
                ? `Extracting… ${progress}%`
                : "Auto-Extract from PDF"}
            </button>
          </div>

          <div className="cem-toolbar-actions">
            {fileUrl && (
              <a
                href={getViewerUrl(fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="cem-btn cem-btn--outline cem-btn--sm"
                title="Open the manuscript in a new tab to compare while editing"
              >
                <FaExternalLinkAlt /> Open file
              </a>
            )}
            <button
              type="button"
              className="cem-btn cem-btn--outline cem-btn--sm"
              onClick={handleCopyPrompt}
            >
              {copiedPrompt ? <FaCheck /> : <FaCopy />}{" "}
              {copiedPrompt ? "Prompt Copied!" : "Copy AI Agent Prompt"}
            </button>
            <button
              type="button"
              className="cem-btn cem-btn--outline cem-btn--sm"
              onClick={toggleRawMode}
            >
              <FaCode />{" "}
              {rawJsonMode ? "Switch to Visual Editor" : "JSON Code Mode"}
            </button>
          </div>
        </div>

        <div className="cem-body">
          {rawJsonMode ? (
            <div className="cem-raw">
              <p className="cem-hint">
                This is your current content as JSON. You can also paste JSON
                generated by Claude or ChatGPT here.
              </p>
              <textarea
                className="cem-raw-textarea"
                value={rawJsonText}
                onChange={(e) => setRawJsonText(e.target.value)}
                rows={18}
                spellCheck={false}
              />
              <button
                type="button"
                className="cem-btn cem-btn--primary"
                onClick={handleApplyRawJson}
              >
                Apply JSON to Visual Blocks
              </button>
            </div>
          ) : (
            <>
              <div className="cem-title-row">
                <label htmlFor="cem-title">Title (optional)</label>
                <input
                  id="cem-title"
                  type="text"
                  className="cem-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Extracted title — your article page already shows its own title"
                />
              </div>

              {sections.map((sec, sIdx) => (
                <div key={sec.id} className="cem-section">
                  <div className="cem-section-head">
                    <input
                      type="text"
                      className="cem-input cem-heading-input"
                      value={sec.heading}
                      onChange={(e) =>
                        patchSection(sec.id, { heading: e.target.value })
                      }
                      placeholder="Section heading (e.g., 1. Introduction)"
                      aria-label="Section heading"
                    />
                    <select
                      className="cem-level"
                      value={sec.level > 1 ? 2 : 1}
                      onChange={(e) =>
                        patchSection(sec.id, { level: Number(e.target.value) })
                      }
                      aria-label="Heading level"
                    >
                      <option value={1}>Heading</option>
                      <option value={2}>Sub-heading</option>
                    </select>
                    <div className="cem-actions">
                      <IconBtn
                        title="Move section up"
                        onClick={() => moveSection(sec.id, -1)}
                        disabled={sIdx === 0}
                      >
                        <FaArrowUp />
                      </IconBtn>
                      <IconBtn
                        title="Move section down"
                        onClick={() => moveSection(sec.id, 1)}
                        disabled={sIdx === sections.length - 1}
                      >
                        <FaArrowDown />
                      </IconBtn>
                      <IconBtn
                        title="Delete section"
                        danger
                        onClick={() => removeSection(sec)}
                      >
                        <FaTrash />
                      </IconBtn>
                    </div>
                  </div>

                  <div className="cem-blocks">
                    {sec.blocks.map((blk, bIdx) => (
                      <div
                        key={blk.id}
                        className={`cem-block cem-block--${blk.type}`}
                      >
                        <div className="cem-block-type">
                          {blk.type === "paragraph" && <FaParagraph />}
                          {blk.type === "quote" && <FaQuoteLeft />}
                          {blk.type === "table" && <FaTable />}
                          {blk.type === "figure" && <FaImage />}
                          <span>{blk.type}</span>
                        </div>

                        <div className="cem-block-content">
                          {(blk.type === "paragraph" ||
                            blk.type === "quote") && (
                            <textarea
                              rows={rowsFor(
                                blk.text,
                                blk.type === "quote" ? 2 : 3,
                              )}
                              className={`cem-textarea${blk.type === "quote" ? " cem-quote-input" : ""}`}
                              value={blk.text ?? ""}
                              onChange={(e) =>
                                patchBlock(sec.id, blk.id, {
                                  text: e.target.value,
                                })
                              }
                              placeholder={
                                blk.type === "quote"
                                  ? "Blockquote or highlighted takeaway…"
                                  : "Paragraph text…"
                              }
                            />
                          )}

                          {blk.type === "table" && (
                            <div className="cem-table-editor">
                              <input
                                type="text"
                                className="cem-input"
                                value={blk.caption || ""}
                                onChange={(e) =>
                                  patchBlock(sec.id, blk.id, {
                                    caption: e.target.value,
                                  })
                                }
                                placeholder="Caption (e.g., Table 1: Baseline characteristics)"
                              />
                              <div className="cem-table-wrap">
                                <table className="cem-table">
                                  <thead>
                                    <tr>
                                      {blk.headers.map((_, c) => (
                                        <th key={c}>
                                          <IconBtn
                                            title={`Delete column ${c + 1}`}
                                            danger
                                            onClick={() =>
                                              removeCol(sec.id, blk.id, c)
                                            }
                                            disabled={blk.headers.length <= 1}
                                          >
                                            <FaTimes />
                                          </IconBtn>
                                        </th>
                                      ))}
                                      <th />
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[blk.headers, ...blk.rows].map(
                                      (row, r) => (
                                        <tr
                                          key={r}
                                          className={
                                            r === 0 ? "cem-head-row" : undefined
                                          }
                                        >
                                          {row.map((cell, c) => (
                                            <td key={c}>
                                              <input
                                                type="text"
                                                className="cem-cell"
                                                value={cell}
                                                onChange={(e) =>
                                                  setCell(
                                                    sec.id,
                                                    blk.id,
                                                    r,
                                                    c,
                                                    e.target.value,
                                                  )
                                                }
                                                onPaste={(e) =>
                                                  handleCellPaste(
                                                    e,
                                                    sec.id,
                                                    blk.id,
                                                    r,
                                                    c,
                                                  )
                                                }
                                                placeholder={
                                                  r === 0 ? "Header" : ""
                                                }
                                                aria-label={
                                                  r === 0
                                                    ? `Header ${c + 1}`
                                                    : `Row ${r}, column ${c + 1}`
                                                }
                                              />
                                            </td>
                                          ))}
                                          <td>
                                            {r > 0 && (
                                              <IconBtn
                                                title={`Delete row ${r}`}
                                                danger
                                                onClick={() =>
                                                  removeRow(sec.id, blk.id, r)
                                                }
                                                disabled={blk.rows.length <= 1}
                                              >
                                                <FaTrash />
                                              </IconBtn>
                                            )}
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                  </tbody>
                                </table>
                              </div>
                              <div className="cem-table-actions">
                                <button
                                  type="button"
                                  className="cem-btn cem-btn--outline cem-btn--xs"
                                  onClick={() => addRow(sec.id, blk.id)}
                                >
                                  <FaPlus /> Row
                                </button>
                                <button
                                  type="button"
                                  className="cem-btn cem-btn--outline cem-btn--xs"
                                  onClick={() => addCol(sec.id, blk.id)}
                                >
                                  <FaPlus /> Column
                                </button>
                                <span className="cem-hint">
                                  Tip: paste cells copied from Excel or Word
                                  into any cell.
                                </span>
                              </div>
                            </div>
                          )}

                          {blk.type === "figure" && (
                            <div className="cem-figure">
                              {blk.url ? (
                                <div className="cem-figure-row">
                                  <img
                                    src={blk.url}
                                    alt="Figure preview"
                                    className="cem-figure-img"
                                  />
                                  <div className="cem-figure-fields">
                                    <input
                                      type="text"
                                      className="cem-input"
                                      value={blk.url}
                                      onChange={(e) =>
                                        patchBlock(sec.id, blk.id, {
                                          url: e.target.value,
                                        })
                                      }
                                      placeholder="Image URL"
                                    />
                                    <button
                                      type="button"
                                      className="cem-btn cem-btn--outline cem-btn--xs"
                                      onClick={() =>
                                        patchBlock(sec.id, blk.id, { url: "" })
                                      }
                                    >
                                      Replace image
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label className="cem-dropzone">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleImageUpload(e, sec.id, blk.id)
                                    }
                                    disabled={uploadingId !== null}
                                  />
                                  {uploadingId === blk.id && (
                                    <span className="cem-uploading">
                                      Uploading to Cloudinary…
                                    </span>
                                  )}
                                </label>
                              )}
                              <input
                                type="text"
                                className="cem-input"
                                value={blk.caption || ""}
                                onChange={(e) =>
                                  patchBlock(sec.id, blk.id, {
                                    caption: e.target.value,
                                  })
                                }
                                placeholder="Caption (e.g., Figure 1: Experimental setup)"
                              />
                            </div>
                          )}
                        </div>

                        <div className="cem-actions">
                          <IconBtn
                            title="Move block up"
                            onClick={() => moveBlock(sec.id, blk.id, -1)}
                            disabled={bIdx === 0}
                          >
                            <FaArrowUp />
                          </IconBtn>
                          <IconBtn
                            title="Move block down"
                            onClick={() => moveBlock(sec.id, blk.id, 1)}
                            disabled={bIdx === sec.blocks.length - 1}
                          >
                            <FaArrowDown />
                          </IconBtn>
                          <IconBtn
                            title="Delete block"
                            danger
                            onClick={() => removeBlock(sec.id, blk.id)}
                          >
                            <FaTrash />
                          </IconBtn>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cem-add-row">
                    <span>Add to section:</span>
                    {["paragraph", "quote", "figure", "table"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className="cem-btn cem-btn--outline cem-btn--xs"
                        onClick={() => addBlock(sec.id, type)}
                      >
                        <FaPlus />{" "}
                        {type === "figure"
                          ? "Figure image"
                          : type[0].toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="cem-btn cem-btn--outline cem-add-section"
                onClick={addSection}
              >
                <FaPlus /> Add New Section
              </button>

              <div className="cem-section cem-refs">
                <h3>
                  <FaList /> Bibliography / References ({references.length})
                </h3>
                {references.map((ref, rIdx) => (
                  <div key={ref.id} className="cem-ref-row">
                    <span className="cem-ref-num">[{rIdx + 1}]</span>
                    <textarea
                      rows={rowsFor(ref.text, 1)}
                      className="cem-textarea"
                      value={ref.text}
                      onChange={(e) => updateReference(ref.id, e.target.value)}
                      placeholder="e.g., Smith J. et al. (2026). Journal Name, 10(2), 15-20."
                    />
                    <div className="cem-actions">
                      <IconBtn
                        title="Move reference up"
                        onClick={() => moveReference(ref.id, -1)}
                        disabled={rIdx === 0}
                      >
                        <FaArrowUp />
                      </IconBtn>
                      <IconBtn
                        title="Move reference down"
                        onClick={() => moveReference(ref.id, 1)}
                        disabled={rIdx === references.length - 1}
                      >
                        <FaArrowDown />
                      </IconBtn>
                      <IconBtn
                        title="Delete reference"
                        danger
                        onClick={() => removeReference(ref.id)}
                      >
                        <FaTrash />
                      </IconBtn>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="cem-btn cem-btn--outline cem-btn--sm"
                  onClick={addReference}
                >
                  <FaPlus /> Add Reference
                </button>
              </div>
            </>
          )}
        </div>

        <footer className="cem-footer">
          <button
            type="button"
            className="cem-btn cem-btn--outline"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cem-btn cem-btn--primary"
            onClick={handleFinalSave}
            disabled={rawJsonMode || uploadingId !== null || extracting}
            title={rawJsonMode ? "Apply or leave JSON mode first" : undefined}
          >
            Save Article Content
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
};

export default ContentEditorModal;
