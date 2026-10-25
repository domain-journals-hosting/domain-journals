import * as pdfjsLib from "pdfjs-dist";

/* -------------------------------------------------------------------------- */
/*  Worker (pdfjs-dist v4+, Vite / Webpack 5).                                */
/*  For v3 use: "pdfjs-dist/build/pdf.worker.min.js"                          */
/* -------------------------------------------------------------------------- */
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
}

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */
const DEFAULTS = {
  concurrency: 6, // pages parsed in parallel
  headingSizeRatio: 1.12, // line size / body size to count as "bigger"
  minSizeRatio: 0.82, // drop footnotes / figure text smaller than this (outside references)
  marginRatio: 0.07, // top/bottom page band scanned for headers & footers
  defaultHeading: "Introduction", // heading for text before the first detected heading
  onProgress: null, // (0..1) => void
};

const PDF_PARAMS = {
  disableFontFace: true, // we never render, so skip font loading
  isEvalSupported: false,
  verbosity: 0,
};

const NUM = String.raw`(?:(?:\d+(?:\.\d+){0,3}\.?|[IVXL]+\.)\s*)?`;
const KEYWORDS =
  "abstract|summary|introduction|background|related work|literature review|methods?|methodology|materials and methods|experimental(?:\\s+(?:setup|section))?|results(?:\\s+and\\s+discussion)?|discussion|conclusions?|limitations|future work|acknowledg(?:e)?ments?|funding|appendi(?:x|ces)(?:\\s+[A-Za-z0-9]+)?|supplementary(?:\\s+(?:materials?|information))?";
const REF_WORDS = "references|bibliography|works cited|literature cited";

const KEYWORD_RE = new RegExp(
  `^${NUM}(?:${KEYWORDS}|${REF_WORDS})\\s*[.:]?$`,
  "i",
);
const REF_HEAD_RE = new RegExp(`^${NUM}(?:${REF_WORDS})\\s*[.:]?$`, "i");
const END_HEAD_RE = new RegExp(
  `^${NUM}(?:appendi(?:x|ces)(?:\\s+[A-Za-z0-9]+)?|supplementary(?:\\s+(?:materials?|information))?|acknowledg(?:e)?ments?)\\s*[.:]?$`,
  "i",
);
const NUMBERED_RE = /^(?:\d+(?:\.\d+){0,3}\.?|[IVX]+\.)\s+\p{Lu}/u;
const DEPTH_RE = /^(\d+(?:\.\d+)*)\.?\s/;
const PAGE_NUM_RE =
  /^(?:page\s+)?(?:\d+|[ivxlc]{1,6})(?:\s*(?:of|\/)\s*\d+)?$/i;
const REF_START_RE = /^(?:\[(\d{1,3})\]\s*|(\d{1,3})[.)]\s+)/;
const SENTENCE_END_RE = /[.!?:;"”’)\]]$/;
const LETTERS_RE = /\p{L}{3}/u;

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                             */
/* -------------------------------------------------------------------------- */
const fail = (code, message, cause) => {
  const e = new Error(message, cause ? { cause } : undefined);
  e.code = code;
  return e;
};

const argMax = (map) => {
  let best,
    bv = -1;
  for (const [k, v] of map) if (v > bv) ((best = k), (bv = v));
  return best;
};

const median = (arr) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[s.length >> 1];
};

const bump = (map, key, by) => map.set(key, (map.get(key) || 0) + by);

/** Join lines, repairing "meth-" + "odology" hyphenation. */
const join = (acc, t) => {
  if (!acc) return t;
  if (/\p{Ll}-$/u.test(acc) && /^\p{Ll}/u.test(t)) return acc.slice(0, -1) + t;
  return acc + " " + t;
};

const toParams = async (src) => {
  if (typeof src === "string" || src instanceof URL)
    return { url: String(src) };
  if (typeof Blob !== "undefined" && src instanceof Blob)
    return { data: new Uint8Array(await src.arrayBuffer()) };
  if (src instanceof ArrayBuffer) return { data: new Uint8Array(src) };
  if (ArrayBuffer.isView(src)) return { data: src };
  return src; // assume a pdf.js params object
};

/** Run fn(i) for i in [0, n) with limited concurrency, preserving order. */
const mapPool = async (n, limit, fn) => {
  const out = new Array(n);
  let next = 0;
  const worker = async () => {
    while (next < n) {
      const i = next++;
      out[i] = await fn(i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, n) }, worker));
  return out;
};

/* -------------------------------------------------------------------------- */
/*  Phase 1: page -> ordered lines (with font size / font / geometry)         */
/* -------------------------------------------------------------------------- */

/** Group tokens into rows by baseline proximity. */
const clusterRows = (toks) => {
  toks.sort((a, b) => b.y - a.y || a.x - b.x);
  const rows = [];
  let row = null;
  for (const t of toks) {
    if (row && Math.abs(row.y - t.y) <= Math.max(row.size, t.size) * 0.5)
      row.toks.push(t);
    else rows.push((row = { y: t.y, size: t.size, toks: [t] }));
  }
  return rows;
};

/** Build one text line from x-sorted tokens. Gaps decide spaces (no "Intro duction"). */
const makeLine = (ts, zone, page, H) => {
  let s = "",
    end = null,
    x0 = Infinity,
    x1 = -Infinity;
  const sizeW = new Map(),
    fontW = new Map();
  let anchor = ts[0];
  for (const t of ts) {
    if (
      end !== null &&
      t.x - end > t.size * 0.15 &&
      !s.endsWith(" ") &&
      t.s[0] !== " "
    )
      s += " ";
    s += t.s;
    end = t.x + t.w;
    if (t.x < x0) x0 = t.x;
    if (end > x1) x1 = end;
    bump(sizeW, t.size, t.s.length);
    bump(fontW, t.font, t.s.length);
    if (t.s.length > anchor.s.length) anchor = t;
  }
  return {
    text: s.normalize("NFKC").replace(/\s+/g, " ").trim(),
    x0,
    x1,
    y: anchor.y,
    size: argMax(sizeW),
    font: argMax(fontW),
    zone, // 0 = full width, 1 = left column, 2 = right column
    page,
    rel: anchor.y / H, // 0 = bottom, 1 = top
  };
};

/**
 * Two-column detection via a "gutter": a vertical strip near the page centre
 * that almost no baseline crosses. Robust against word-level and line-level items.
 */
const findGutter = (toks, W) => {
  if (toks.length < 40) return null;
  const BINS = 100;
  const lo = 35,
    hi = 65;
  const binW = W / BINS;
  const baselines = new Set();
  const cover = Array.from({ length: hi - lo }, () => new Set());
  for (const t of toks) {
    const yk = Math.round(t.y);
    baselines.add(yk);
    const b0 = Math.max(lo, Math.floor(t.x / binW));
    const b1 = Math.min(hi - 1, Math.floor((t.x + t.w) / binW));
    for (let b = b0; b <= b1; b++) cover[b - lo].add(yk);
  }
  const limit = baselines.size * 0.25;
  let best = null,
    runStart = -1;
  for (let i = 0; i <= cover.length; i++) {
    const empty = i < cover.length && cover[i].size <= limit;
    if (empty && runStart < 0) runStart = i;
    if (!empty && runStart >= 0) {
      const width = i - runStart;
      if (width >= 2 && (!best || width > best.width))
        best = { width, from: runStart, to: i };
      runStart = -1;
    }
  }
  if (!best) return null;
  const gs = (lo + best.from) * binW,
    ge = (lo + best.to) * binW;
  return { gs, ge, cx: (gs + ge) / 2 };
};

/** Order lines: full-width lines split the page into bands; inside a band, left column then right. */
const orderLines = (wide, left, right) => {
  if (!left.length && !right.length) return wide;
  const out = [];
  let top = Infinity;
  for (const w of [...wide, null]) {
    const lo = w ? w.y : -Infinity;
    for (const col of [left, right])
      for (const l of col) if (l.y < top && l.y > lo) out.push(l);
    if (w) out.push(w);
    top = lo;
  }
  return out;
};

const readPage = async (pdf, pageNum) => {
  const page = await pdf.getPage(pageNum);
  try {
    const [vx0, vy0, vx1, vy1] = page.view;
    const W = vx1 - vx0,
      H = vy1 - vy0;
    const { items } = await page.getTextContent();

    const toks = [];
    for (const it of items) {
      const s = it.str;
      if (!s || !s.trim()) continue;
      const [a, b, , , e, f] = it.transform;
      if (Math.abs(b) > Math.abs(a) * 0.3) continue; // rotated text (side stamps, watermarks)
      const size = Math.round(Math.hypot(a, b) * 2) / 2;
      if (size < 1) continue;
      toks.push({
        s,
        x: e - vx0,
        y: f - vy0,
        w: it.width,
        size,
        font: it.fontName,
      });
    }
    if (!toks.length) return [];

    const rows = clusterRows(toks);
    const g = findGutter(toks, W);
    const wide = [],
      left = [],
      right = [];

    for (const row of rows) {
      row.toks.sort((p, q) => p.x - q.x);
      if (!g) {
        wide.push(makeLine(row.toks, 0, pageNum, H));
        continue;
      }
      const L = [],
        R = [];
      let straddle = false;
      for (const t of row.toks) {
        if (t.x < g.gs && t.x + t.w > g.ge) straddle = true;
        (t.x + t.w / 2 < g.cx ? L : R).push(t);
      }
      const last = L[L.length - 1];
      const isWide =
        straddle ||
        (L.length &&
          R.length &&
          R[0].x - (last.x + last.w) < (g.ge - g.gs) * 0.9);
      if (isWide) wide.push(makeLine(row.toks, 0, pageNum, H));
      else {
        if (L.length) left.push(makeLine(L, 1, pageNum, H));
        if (R.length) right.push(makeLine(R, 2, pageNum, H));
      }
    }
    return orderLines(wide, left, right).filter((l) => l.text);
  } finally {
    page.cleanup();
  }
};

/* -------------------------------------------------------------------------- */
/*  Phase 2: document-wide analysis                                           */
/* -------------------------------------------------------------------------- */

/** Remove page numbers and headers/footers repeated on many pages. */
const stripMargins = (pages, opts) => {
  const n = pages.length;
  const keyOf = (l) => l.text.toLowerCase().replace(/\d+/g, "#");
  const inMargin = (l) =>
    l.rel > 1 - opts.marginRatio || l.rel < opts.marginRatio;
  const counts = new Map();
  if (n >= 3) {
    for (const p of pages) {
      const seen = new Set();
      for (const l of p) if (inMargin(l)) seen.add(keyOf(l));
      for (const k of seen) bump(counts, k, 1);
    }
  }
  const need = Math.max(2, Math.ceil(n * 0.4));
  return pages.map((p) =>
    p.filter(
      (l) =>
        !(
          inMargin(l) &&
          (PAGE_NUM_RE.test(l.text) || (counts.get(keyOf(l)) || 0) >= need)
        ),
    ),
  );
};

const analyse = (pages) => {
  const all = pages.flat();
  const sizeChars = new Map();
  for (const l of all) bump(sizeChars, l.size, l.text.length);
  const body = argMax(sizeChars);

  const fontChars = new Map();
  for (const l of all)
    if (Math.abs(l.size - body) <= 0.5) bump(fontChars, l.font, l.text.length);
  const bodyFont = argMax(fontChars);

  const gaps = [];
  const zoneRight = [0, 0, 0];
  const pageRight = new Map();
  for (let i = 0; i < all.length; i++) {
    const l = all[i];
    if (Math.abs(l.size - body) > 0.5) continue;
    const key = l.page * 3 + l.zone;
    if (l.x1 > (pageRight.get(key) || 0)) pageRight.set(key, l.x1);
    if (l.x1 > zoneRight[l.zone]) zoneRight[l.zone] = l.x1;
    const p = all[i - 1];
    if (
      p &&
      p.page === l.page &&
      p.zone === l.zone &&
      Math.abs(p.size - body) <= 0.5
    ) {
      const g = p.y - l.y;
      if (g > 0 && g < body * 2.5) gaps.push(g);
    }
  }

  return {
    body,
    bodyFont,
    lineGap: median(gaps) || body * 1.2,
    rightOf: (l) =>
      Math.max(pageRight.get(l.page * 3 + l.zone) || 0, zoneRight[l.zone]),
    maxSizeFirstPage: Math.max(0, ...(pages[0] || []).map((l) => l.size)),
  };
};

/* -------------------------------------------------------------------------- */
/*  Phase 3: lines -> sections / paragraphs / references                      */
/* -------------------------------------------------------------------------- */
const parseLines = (lines, ctx, opts, firstPage) => {
  const { body, bodyFont, lineGap, rightOf, maxSizeFirstPage } = ctx;
  const depthOf = (t) => {
    const m = DEPTH_RE.exec(t);
    return m ? Math.min(m[1].split(".").length, 6) : 0;
  };

  const sections = [],
    references = [];
  let title = "",
    titleOpen = false,
    titleDone = false,
    seenHeading = false;
  let cur = {
    heading: opts.defaultHeading,
    blocks: [],
    size: body,
    depth: 0,
    isDefault: true,
  };
  let para = "",
    prev = null,
    inRefs = false,
    lastNum = 0,
    lastHead = null;

  const flush = () => {
    const t = para.trim();
    para = "";
    if (!t) return;
    if (inRefs) references.push(t);
    else cur.blocks.push({ type: "paragraph", text: t });
  };
  const closeSection = () => {
    if (cur && !(cur.isDefault && !cur.blocks.length)) sections.push(cur);
  };
  const isHeading = (ln) => {
    const t = ln.text;
    if (KEYWORD_RE.test(t)) return true;
    if (
      t.length < 3 ||
      t.length > 100 ||
      /[.,;]$/.test(t) ||
      !LETTERS_RE.test(t)
    )
      return false;
    const bigger = ln.size >= body * opts.headingSizeRatio;
    const styled = ln.font !== bodyFont;
    return (
      (bigger && (styled || ln.size >= body * 1.3)) ||
      (styled && NUMBERED_RE.test(t))
    );
  };
  const startSection = (ln) => {
    const t = ln.text;
    // multi-line heading: same size, tight spacing, no body text yet
    if (
      lastHead &&
      cur === lastHead.sec &&
      !para &&
      ln.page === lastHead.page &&
      ln.size === lastHead.size &&
      ln.size > body * 1.05 &&
      lastHead.y - ln.y < ln.size * 1.8 &&
      !NUMBERED_RE.test(t) &&
      !KEYWORD_RE.test(t)
    ) {
      cur.heading += " " + t;
      lastHead.y = ln.y;
      return;
    }
    flush();
    closeSection();
    cur = {
      heading: t,
      blocks: [],
      size: ln.size,
      depth: depthOf(t),
      isDefault: false,
    };
    lastHead = { sec: cur, page: ln.page, size: ln.size, y: ln.y };
    seenHeading = true;
  };

  for (const ln of lines) {
    const t = ln.text;

    // Title: largest text at the top of the first page, before any content
    if (!titleDone && !seenHeading && ln.page === firstPage) {
      if (
        ln.size >= maxSizeFirstPage - 0.5 &&
        ln.size >= body * 1.35 &&
        (titleOpen || (!para && !cur.blocks.length))
      ) {
        title += (title ? " " : "") + t;
        titleOpen = true;
        prev = ln;
        continue;
      }
      if (titleOpen) titleDone = true;
    }

    // Footnotes, figure text, tiny print (references are often small, so keep those)
    if (!inRefs && ln.size < body * opts.minSizeRatio) continue;

    const gap =
      prev && prev.page === ln.page && prev.zone === ln.zone
        ? prev.y - ln.y
        : null;

    if (inRefs) {
      if (END_HEAD_RE.test(t)) {
        flush();
        inRefs = false;
        cur = null;
        startSection(ln);
        prev = ln;
        continue;
      }
      const m = REF_START_RE.exec(t);
      const n = m ? +(m[1] ?? m[2]) : 0;
      let isNew = !para;
      if (!isNew) {
        const numbered =
          m && (lastNum === 0 || (n > lastNum && n <= lastNum + 3));
        const gapBreak = gap !== null && gap > lineGap * 1.35;
        const hanging =
          prev &&
          prev.zone === ln.zone &&
          prev.page === ln.page &&
          ln.x0 < prev.x0 - ln.size * 0.4;
        isNew = !!(numbered || gapBreak || hanging);
      }
      if (isNew) {
        flush();
        para = t;
        if (m) lastNum = n;
      } else para = join(para, t);
      prev = ln;
      continue;
    }

    if (REF_HEAD_RE.test(t)) {
      flush();
      closeSection();
      cur = null;
      lastHead = null;
      inRefs = true;
      lastNum = 0;
      prev = ln;
      continue;
    }

    if (isHeading(ln)) {
      startSection(ln);
      prev = ln;
      continue;
    }

    // Paragraph boundary: spacing gap, first-line indent, or short line ending a sentence
    let brk = false;
    if (para && prev) {
      if (gap !== null && gap > lineGap * 1.45) brk = true;
      else if (SENTENCE_END_RE.test(para)) {
        if (ln.x0 - prev.x0 > ln.size * 0.8) brk = true;
        else if (prev.x1 < rightOf(prev) - ln.size * 3.5) brk = true;
      }
    }
    if (brk) {
      flush();
      para = t;
    } else para = para ? join(para, t) : t;
    prev = ln;
  }

  flush();
  closeSection();

  // Heading levels: numeric depth ("2.1" -> 2), otherwise rank by font size
  const sizes = [
    ...new Set(
      sections.filter((s) => !s.isDefault && !s.depth).map((s) => s.size),
    ),
  ].sort((a, b) => b - a);
  const out = sections.map((s) => ({
    heading: s.heading,
    level: s.isDefault ? 1 : s.depth || Math.min(sizes.indexOf(s.size) + 1, 6),
    blocks: s.blocks,
  }));

  return {
    title,
    sections: out.length
      ? out
      : [{ heading: "Main Content", level: 1, blocks: [] }],
    references,
  };
};

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Extracts structured article JSON from a PDF between startPage and endPage.
 *
 * @param {string|URL|Blob|ArrayBuffer|Uint8Array|object} source  URL, File/Blob, bytes or pdf.js params
 * @param {number} startPage  1-based
 * @param {number|null} endPage  inclusive; null = last page
 * @param {Partial<typeof DEFAULTS>} options
 * @returns {Promise<{title: string, sections: {heading: string, level: number, blocks: {type: string, text: string}[]}[], references: string[]}>}
 */
export const extractPdfContent = async (
  source,
  startPage = 1,
  endPage = null,
  options = {},
) => {
  const opts = { ...DEFAULTS, ...options };
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({
      ...PDF_PARAMS,
      ...(await toParams(source)),
    }).promise;

    const total = pdf.numPages;
    const start = Math.max(1, Math.floor(Number(startPage) || 1));
    const end = Math.min(total, endPage ? Math.floor(Number(endPage)) : total);
    if (start > end)
      throw fail(
        "BAD_RANGE",
        `Invalid page range ${start}-${end} (document has ${total} pages).`,
      );

    const count = end - start + 1;
    let done = 0;
    const raw = await mapPool(count, opts.concurrency, async (i) => {
      const lines = await readPage(pdf, start + i);
      opts.onProgress?.(++done / count);
      return lines;
    });

    const pages = stripMargins(raw, opts);
    const chars = pages.reduce(
      (n, p) => n + p.reduce((m, l) => m + l.text.length, 0),
      0,
    );
    if (chars < 40 * count) {
      throw fail(
        "NO_TEXT",
        "No readable text found. This looks like a scanned PDF; it needs OCR or the AI JSON paste mode.",
      );
    }

    const ctx = analyse(pages);
    return parseLines(pages.flat(), ctx, opts, start);
  } catch (err) {
    if (err?.code === "NO_TEXT" || err?.code === "BAD_RANGE") throw err;
    console.error("PDF extraction error:", err);
    throw fail(
      "EXTRACT_FAILED",
      "Could not extract text from PDF file. Try adjusting page range or use AI JSON paste mode.",
      err,
    );
  } finally {
    await pdf.cleanup();
  }
};
