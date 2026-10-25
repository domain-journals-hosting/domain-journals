// src/utils/fileHelpers.js
const backendBase =
  import.meta.env.VITE_API_BASE_URL || "https://api.domainjournals.com";

/**
 * Returns a URL for viewing the document in-browser.
 * If Cloudinary PDF/Doc, ensures raw view access.
 */
export const getViewerUrl = (fileUrl) => {
  if (!fileUrl) return "#";

  // Google Docs Viewer fallback for doc/docx/pdf
  return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
};

/**
 * Returns a URL forced for downloading.
 * For Cloudinary URLs, injects fl_attachment flag; otherwise proxies via backend endpoint.
 */
export const getDownloadUrl = (fileUrl) => {
  if (!fileUrl) return "#";

  // Cloudinary direct attachment download transformation
  if (fileUrl.includes("res.cloudinary.com")) {
    return fileUrl.replace("/upload/", "/upload/fl_attachment/");
  }

  // Fallback to backend file proxy
  return `${backendBase}/file?url=${encodeURIComponent(fileUrl)}`;
};
