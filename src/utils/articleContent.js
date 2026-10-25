/**
 * Shared helpers for the article-content JSON format.
 * Kept free of pdfjs so the public article page doesn't bundle it.
 *
 * Stored format (JSON string in `Accepted.content`):
 * {
 *   title?: string,
 *   sections: [{ heading, level, blocks: [
 *     { type: "paragraph" | "quote", text } | { type: "figure", url, caption }
 *   ] }],
 *   references: string[]
 * }
 */

const MAX_LEVEL = 6;
const isHttpUrl = (u) => /^https?:\/\//i.test(u);

/** "[3] Smith..." / "3. Smith..." -> "Smith..." (the UI numbers references itself). */
export const stripRefMarker = (s) =>
  String(s ?? "")
    .replace(/^\s*(?:\[\d{1,3}\]|\d{1,3}[.)])\s*/, "")
    .trim();

const normalizeBlock = (b) => {
  if (b?.type === "figure") {
    const url = String(b.url ?? "").trim();
    return [
      {
        type: "figure",
        url: isHttpUrl(url) ? url : "",
        caption: String(b.caption ?? ""),
      },
    ];
  }
  if (typeof b?.text === "string") {
    return [{ type: b.type === "quote" ? "quote" : "paragraph", text: b.text }];
  }
  return [];
};

/**
 * Parses and normalises content JSON (from storage, or pasted from an AI).
 * Strips code fences / surrounding prose. Throws a readable Error if invalid.
 */
export const parseAiJson = (text) => {
  let clean = String(text ?? "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const a = clean.indexOf("{"),
    b = clean.lastIndexOf("}");
  if (a > 0 && b > a) clean = clean.slice(a, b + 1);

  let data;
  try {
    data = JSON.parse(clean);
  } catch (e) {
    throw new Error(`Invalid JSON: ${e.message}`);
  }
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
      "heading": "1.1 Background",
      "level": 2,
      "blocks": [ { "type": "paragraph", "text": "..." } ]
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
3. Maintain sequential paragraph order under each heading. Join lines broken by the PDF layout into whole paragraphs, and repair words split by hyphenation.
4. Allowed block types inside 'blocks': "paragraph" or "quote". Do not include figures, tables, page numbers, headers or footers.
5. Put every citation inside the root "references" array, one string per reference, without the leading number.
6. Do NOT include markdown code fences (\`\`\`json). Output pure JSON only.`;
