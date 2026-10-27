/**
 * Shared helpers for the article-content JSON format.
 * Kept free of pdfjs so the public article page doesn't bundle it.
 *
 * Stored format (JSON string in `Accepted.content`):
 * {
 *   title?: string,
 *   sections: [{ heading, level, blocks: [
 *     { type: "paragraph" | "quote", text }
 *     | { type: "figure", url, caption }
 *     | { type: "table", caption, headers: string[], rows: string[][] }
 *   ] }],
 *   references: string[]
 * }
 *
 * Table invariants (enforced by normalizeBlock): every row has exactly as many cells as
 * `headers`. `headers` is all empty strings when the table has no header row.
 */

const MAX_LEVEL = 6;
const isHttpUrl = (u) => /^https?:\/\//i.test(u);

/** "[3] Smith..." / "3. Smith..." -> "Smith..." (the UI numbers references itself). */
export const stripRefMarker = (s) =>
  String(s ?? "")
    .replace(/^\s*(?:\[\d{1,3}\]|\d{1,3}[.)])\s*/, "")
    .trim();

const cell = (v) =>
  (v == null
    ? ""
    : typeof v === "object"
      ? JSON.stringify(v)
      : String(v)
  ).trim();

// A row may arrive as an array, or (from some AI output) as an object of column -> value
const toRow = (r) =>
  (Array.isArray(r)
    ? r
    : r && typeof r === "object"
      ? Object.values(r)
      : [r]
  ).map(cell);

const normalizeTable = (b) => {
  const rawHeaders = b.headers ?? b.header ?? b.columns;
  const rawRows = b.rows ?? b.data;

  const headers = Array.isArray(rawHeaders) ? rawHeaders.map(cell) : [];
  const rows = (Array.isArray(rawRows) ? rawRows : []).map(toRow);

  const cols = rows.reduce((m, r) => Math.max(m, r.length), headers.length);
  if (!cols) return [];

  const pad = (r) =>
    r.length < cols ? [...r, ...Array(cols - r.length).fill("")] : r;
  return [
    {
      type: "table",
      caption: String(b.caption ?? "").trim(),
      headers: pad(headers),
      rows: rows.map(pad),
    },
  ];
};

/** One raw block -> [normalized block], or [] when it is unusable. */
const normalizeBlock = (b) => {
  const type = String(b?.type ?? "").toLowerCase();

  if (type === "figure") {
    const url = String(b.url ?? "").trim();
    return [
      {
        type: "figure",
        url: isHttpUrl(url) ? url : "",
        caption: String(b.caption ?? ""),
      },
    ];
  }
  if (type === "table") return normalizeTable(b);
  if (typeof b?.text === "string") {
    return [{ type: type === "quote" ? "quote" : "paragraph", text: b.text }];
  }
  return [];
};

/** True when a normalized block has anything worth saving / showing. */
export const blockHasContent = (b) => {
  if (b.type === "figure") return !!b.url?.trim();
  if (b.type === "table")
    return [...(b.headers || []), ...(b.rows || []).flat()].some((c) =>
      String(c).trim(),
    );
  return !!b.text?.trim();
};

const tryParse = (s) => {
  try {
    return { data: JSON.parse(s) };
  } catch (error) {
    return { error };
  }
};

/**
 * Parses and normalises content JSON (from storage, or pasted from an AI).
 * Strips code fences / surrounding prose and tolerates trailing commas.
 * Throws a readable Error if the result is unusable.
 */
export const parseAiJson = (text) => {
  let clean = String(text ?? "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const a = clean.indexOf("{"),
    b = clean.lastIndexOf("}");
  if (a > 0 && b > a) clean = clean.slice(a, b + 1);

  let result = tryParse(clean);
  const firstError = result.error;
  // AI output often has trailing commas; only try the repair when strict parsing failed
  if (firstError) result = tryParse(clean.replace(/,\s*([}\]])/g, "$1"));
  if (result.error) {
    const cutOff = /[}\]]\s*$/.test(clean)
      ? ""
      : " The text looks cut off: ask the AI to continue, or extract fewer pages at a time.";
    throw new Error(`Invalid JSON: ${firstError.message}.${cutOff}`);
  }

  const data = result.data;
  if (!data || !Array.isArray(data.sections))
    throw new Error('JSON must contain a "sections" array.');

  return {
    title: typeof data.title === "string" ? data.title : "",
    sections: data.sections.map((s, i) => ({
      heading: String(s?.heading ?? `Section ${i + 1}`),
      level:
        Number.isInteger(s?.level) && s.level >= 1 && s.level <= MAX_LEVEL
          ? s.level
          : 1,
      blocks: (Array.isArray(s?.blocks) ? s.blocks : []).flatMap(
        normalizeBlock,
      ),
    })),
    references: (Array.isArray(data.references) ? data.references : []).map(
      String,
    ),
  };
};

/** Normalised content object, or null when `raw` is empty / legacy (plain text or HTML). */
export const parseStoredContent = (raw) => {
  if (!raw) return null;
  try {
    return parseAiJson(typeof raw === "string" ? raw : JSON.stringify(raw));
  } catch {
    return null;
  }
};

/** Prompt to copy when uploading a PDF straight to ChatGPT / Claude. */
export const generateAiPrompt =
  () => `Extract the text of the attached manuscript file and output ONLY valid JSON using this exact schema:

{
  "title": "Full article title",
  "sections": [
    {
      "heading": "1. Introduction",
      "level": 1,
      "blocks": [
        { "type": "paragraph", "text": "Full text of paragraph 1..." },
        { "type": "quote", "text": "Callout or notable quote text..." }
      ]
    },
    {
      "heading": "3. Results",
      "level": 1,
      "blocks": [
        { "type": "paragraph", "text": "Table 1 summarises the groups..." },
        { "type": "figure", "url": "", "caption": "Figure 1: Study design" },
        {
          "type": "table",
          "caption": "Table 1: Baseline characteristics of participants",
          "headers": ["Group", "n", "Mean age (SD)"],
          "rows": [
            ["Control", "42", "34.1 (5.2)"],
            ["Treatment", "40", "33.8 (4.9)"]
          ]
        }
      ]
    }
  ],
  "references": [
    "Author A, et al. (2026). Article Title. Journal Name...",
    "Author B. (2025). Book Title..."
  ]
}

Rules:
1. Divide text logically into article headings (Abstract, Introduction, Methodology, Results, Discussion, Conclusion).
2. "level" is 1 for main headings and 2 for sub-headings.
3. Maintain sequential order. Join lines broken by the PDF layout into whole paragraphs, and repair words split by hyphenation.
4. Allowed block types inside 'blocks': "paragraph", "quote", "table" and "figure". Do not include page numbers, headers or footers.
5. Tables:
   - Output every data table as a "table" block, placed in the section and position where it appears in the paper. Never write a table as a paragraph, as markdown, or as a picture.
   - "caption" is the full caption including its label (for example "Table 2: Results by group"). Put any table notes or sources at the end of the caption.
   - "headers" is the column header row. Use an empty array [] if the table has no header row.
   - "rows" is an array of rows, and every row is an array of strings with exactly as many cells as there are columns.
   - Copy every cell exactly: keep numbers, units, symbols and markers such as * or superscript letters. Use "" for an empty cell. For merged cells, repeat the value in each column it spans. Never invent or round data.
   - A table that continues across pages is ONE table block.
   - Do not turn charts or figures into tables.
6. Figures:
   - For every figure, output a "figure" block at the position where the figure appears, with "url" set to "" (images are added later by hand).
   - "caption" holds only the figure's own label, title and legend (for example "Figure 1: Study design. Boxes show..."), plus any source note.
   - Body text that merely sits above or below a figure is NOT part of the caption: keep it as normal paragraphs before and after the figure block.
7. Put every citation inside the root "references" array, one string per reference, without the leading number.
8. Do NOT include markdown code fences (\`\`\`json). Output pure JSON only.`;
