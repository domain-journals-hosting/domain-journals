export default function slugify(str) {
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const reverseSlug = (str = "") =>
  str
    .split("-")
    .map((word) => word.replace(/\b\w/g, (char) => char.toUpperCase()))
    .join(" ");
