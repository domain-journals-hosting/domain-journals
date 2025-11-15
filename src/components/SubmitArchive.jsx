import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import { uploadPdf, deletePdf } from "../components/supabaseUpload";
import journals, { slug } from "../data/journals";

const SubmitArchive = () => {
  const currentYear = new Date().getFullYear();
  const fileInputRef = useRef(null);
  const [volume, setVolume] = useState(currentYear);
  const [issue, setIssue] = useState("");
  const [uploadMethod, setUploadMethod] = useState("file");
  const [link, setLink] = useState("");
  const [journal, setJournal] = useState(slug(journals[0]));
  const [file, setFile] = useState(null);
  const [archives, setArchives] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState({
    open: false,
    action: null,
    text: "",
  });

  const showMessage = (msg, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  };

  const fetchArchives = async () => {
    try {
      const res = await axios.get("/archives");
      setArchives(res.data);
    } catch (err) {
      showMessage("Failed to load archives");
    }
  };

  useEffect(() => {
    if (!archives?.length) fetchArchives();
  }, []);

  const handleUpload = async () => {
    if (isNaN(issue) || isNaN(volume))
      return showMessage("Invalid issue or volume entry");
    if (
      (uploadMethod === "file" && !file) ||
      (uploadMethod === "link" && !link) ||
      !issue
    )
      return showMessage("Issue and file/link required");
    const existing = archives?.find(
      (a) =>
        Number(a.volume) === Number(volume) &&
        Number(a.issue) === Number(issue.trim()) &&
        journal === a.journal
    );

    if (existing) {
      setConfirm({
        open: true,
        text: `Archive for volume ${volume}, issue ${issue} already exists. Overwrite?`,
        action: () => doUpload(existing),
      });
    } else {
      doUpload(null);
    }
  };

  const currentVolume = new Date().getFullYear() - 2024;
  const volumeArray = Array.from(
    { length: currentVolume },
    (_, i) => currentVolume - i
  );

  volumeArray.unshift(null);

  const doUpload = async (existing) => {
    setUploading(true);
    setStatusText("Uploading file..., this might take a while");

    try {
      if (uploadMethod === "link") {
        await axios.post("/archives", {
          volume,
          issue,
          journal,
          file: link,
        });
      } else {
        if (existing?.file) {
          await deletePdf(existing.file);
        }

        const { url, error } = await uploadPdf(file);
        if (error) throw new Error("Upload failed");

        const filePath = url.split("/").pop();

        setStatusText("Saving archive...");

        await axios.post("/archives", {
          volume,
          issue,
          journal,
          file: uploadMethod === "link" ? link : filePath,
        });
      }

      showMessage("Archive created");
      setIssue("");
      setFile(null);
      setLink("");

      fileInputRef.current.value = null;
      fetchArchives();
    } catch (err) {
      showMessage(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      setStatusText("");
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "500px", margin: "auto" }}>
      {confirm.open ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "6px",
              width: "300px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            <p style={{ marginBottom: "20px" }}>{confirm.text}</p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirm({ open: false })}
                style={{
                  padding: "6px 12px",
                  marginRight: "10px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => confirm.action && confirm.action()}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#d9534f",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {message && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "10px",
            backgroundColor: "#333",
            color: "white",
            borderRadius: "4px",
          }}
        >
          {message}
        </div>
      )}

      <h2 style={{ marginBottom: "1rem" }}>Upload Archive</h2>

      {/* Volume */}
      <div style={{ marginBottom: "1rem" }}>
        <label>Volume:</label>
        <select
          disabled={uploading}
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
        >
          {volumeArray.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      {/* Issue */}
      <div style={{ marginBottom: "1rem" }}>
        <label>Issue:</label>
        <input
          type="number"
          disabled={uploading}
          placeholder="Enter issue..."
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
        />
      </div>

      {/* Journal */}
      <div style={{ marginBottom: "1rem" }}>
        <label>Journal:</label>
        <select
          disabled={uploading}
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
        >
          {journals.map((j) => (
            <option key={j} value={slug(j)}>
              {j}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Upload method:</label>
        <select
          disabled={uploading}
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          value={uploadMethod}
          onChange={(e) => setUploadMethod(e.target.value)}
        >
          {["link", "file"].map((a) => (
            <option key={a} value={a}>
              {a.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Link */}
      {uploadMethod === "link" && (
        <div style={{ marginBottom: "1rem" }}>
          <label>Link (eg. Google drive):</label>
          <input
            type="text"
            disabled={uploading}
            placeholder="Enter link..."
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
      )}
      {/* File */}
      {uploadMethod === "file" && (
        <div style={{ marginBottom: "1rem" }}>
          <label>Manuscript File (PDF):</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            disabled={uploading}
            style={{ width: "100%", marginTop: "0.25rem" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          width: "100%",
          padding: "0.75rem",
          backgroundColor: uploading ? "#60a5fa" : "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: "0.5rem",
          fontWeight: "bold",
          cursor: uploading ? "not-allowed" : "pointer",
        }}
      >
        {uploading ? statusText : "Upload Archive"}
      </button>

      {uploading && (
        <p
          style={{
            marginTop: "0.75rem",
            color: "#3b82f6",
            textAlign: "center",
          }}
        >
          {statusText}
        </p>
      )}
    </div>
  );
};

export default SubmitArchive;
