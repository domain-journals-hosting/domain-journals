import { useEffect, useRef, useState } from "react";
import { FaExternalLinkAlt, FaUpload, FaCheck } from "react-icons/fa";
import axios from "../api/axios";
import { getViewerUrl } from "../utils/fileHelpers";
import "../styles/fileUploadField.css";

const isCancel = (err) =>
  err?.code === "ERR_CANCELED" ||
  err?.name === "CanceledError" ||
  err?.name === "AbortError";

/**
 * File URL field with upload.
 *  - editable URL + "Open" link (new tab)
 *  - picking a file uploads it immediately (no second click) with progress
 *  - validates extension and size before sending
 *  - calls onChange(url) with the uploaded URL; the parent saves it with its own form
 */
const FileUploadField = ({
  label = "File",
  value = "",
  onChange,
  onBusyChange,
  accept = ".pdf,.doc,.docx",
  maxSizeMB = 10,
  required = false,
  endpoint = "/file",
}) => {
  const [status, setStatus] = useState({ type: "idle" });
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // Abort an in-flight upload if the form closes
  useEffect(() => () => abortRef.current?.abort(), []);

  const uploading = status.type === "uploading";
  const isUrl = /^https?:\/\//i.test(value || "");

  const validate = (file) => {
    const allowed = accept.split(",").map((s) => s.trim().toLowerCase());
    const dot = file.name.lastIndexOf(".");
    const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
    if (!allowed.includes(ext))
      return `Unsupported file type. Allowed: ${allowed.join(", ")}`;
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024)
      return `File is larger than ${maxSizeMB} MB.`;
    return "";
  };

  const handleSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allows re-picking the same file
    if (!file) return;

    const problem = validate(file);
    if (problem) return setStatus({ type: "error", message: problem });

    const formData = new FormData();
    formData.append("file", file);

    const controller = new AbortController();
    abortRef.current = controller;
    setStatus({ type: "uploading", name: file.name });
    setProgress(0);
    onBusyChange?.(true);

    try {
      const { data } = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: controller.signal,
        onUploadProgress: (ev) =>
          ev.total && setProgress(Math.round((ev.loaded / ev.total) * 100)),
      });
      if (!data?.url) throw new Error("The server did not return a file URL.");
      onChange(data.url);
      setStatus({ type: "success", name: file.name });
    } catch (err) {
      if (isCancel(err)) return;
      setStatus({
        type: "error",
        message:
          err.response?.data?.error ||
          err.message ||
          "Upload failed. Please try again.",
      });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      if (!controller.signal.aborted) onBusyChange?.(false);
    }
  };

  return (
    <div className="ufield">
      <label className="form-label">
        {label}
        {required && <span className="required-star"> *</span>}
      </label>

      <div className="ufield-row">
        <input
          type="text"
          className="form-input"
          value={value || ""}
          onChange={(e) => {
            onChange(e.target.value);
            setStatus({ type: "idle" });
          }}
          required={required}
          placeholder="File URL"
          aria-label={`${label} URL`}
        />
        {isUrl && (
          <a
            href={getViewerUrl(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="ufield-open"
            title="Open file in a new tab"
          >
            <FaExternalLinkAlt /> Open
          </a>
        )}
      </div>

      <div className="ufield-row">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleSelect}
          hidden
        />
        <button
          type="button"
          className="btn-sage-outline ufield-btn"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <FaUpload />{" "}
          {uploading ? `Uploading… ${progress}%` : "Upload new file"}
        </button>
        <span className="ufield-hint">
          PDF, DOC or DOCX, up to {maxSizeMB} MB. Uploads start as soon as you
          pick a file.
        </span>
      </div>

      {uploading && (
        <div className="ufield-bar" aria-hidden="true">
          <div style={{ width: `${progress}%` }} />
        </div>
      )}
      {status.type === "success" && (
        <p className="ufield-ok" role="status">
          <FaCheck /> Uploaded {status.name}. Save your changes to keep it.
        </p>
      )}
      {status.type === "error" && (
        <p className="ufield-err" role="alert">
          {status.message}
        </p>
      )}
    </div>
  );
};

export default FileUploadField;
