import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import journals, { slug } from "../data/journals";
const backendBase = import.meta.env.VITE_API_BASE_URL;

const SubmitArchive = () => {
  const fileInputRef = useRef(null);
  const [issue, setIssue] = useState("");
  const [year, setYear] = useState("");
  const [uploadMethod, setUploadMethod] = useState("file");
  const [link, setLink] = useState("");
  const [journal, setJournal] = useState(slug(journals[0]));
  const [file, setFile] = useState(null);
  const [archives, setArchives] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(100);
  const [confirm, setConfirm] = useState({
    open: false,
    action: null,
    text: "",
  });

  const getVolume = (targetYear) => {
    const sortedYears = [...new Set(archives.map((a) => Number(a.year)))].sort(
      (a, b) => a - b,
    );
    return sortedYears.indexOf(Number(targetYear)) + 1;
  };

  const showMessage = (msg, duration = 10000) => {
    setMessage(msg);
    setProgress(100);
    const durationPercentage = duration / 100;
    const ticksAmt = 100 / durationPercentage;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - ticksAmt;
      });
    }, 100);
    setTimeout(() => {
      setMessage("");
      setProgress(100);
      clearInterval(interval);
    }, duration);
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
    if (isNaN(issue) || isNaN(year))
      return showMessage("Invalid issue or year entry");
    if (
      (uploadMethod === "file" && !file) ||
      (uploadMethod === "link" && !link) ||
      !issue ||
      !year
    )
      return showMessage("Year, issue and file/link required");

    const existing = archives?.find(
      (a) =>
        Number(a.year) === Number(year) &&
        Number(a.issue) === Number(issue.trim()) &&
        journal === a.journal,
    );

    if (existing) {
      setConfirm({
        open: true,
        text: `Archive for year ${year}, issue ${issue} already exists. Overwrite?`,
        action: () => doUpload(existing),
      });
    } else {
      doUpload(null);
    }
  };

  const handleDelete = async (archive) => {
    setConfirm({
      open: true,
      text: `Delete archive year ${archive.year}, issue ${archive.issue}?`,
      action: async () => {
        try {
          if (archive.file && !archive.file.startsWith("http")) {
            await axios.delete("/supabase/delete", {
              data: { filePath: archive.file },
            });
          }
          await axios.delete(`/archives/${archive._id}`);
          showMessage("Archive deleted");
          fetchArchives();
        } catch (err) {
          showMessage("Delete failed");
        } finally {
          setConfirm({ open: false, action: null, text: "" });
        }
      },
    });
  };

  const doUpload = async (existing) => {
    setUploading(true);
    setStatusText("Uploading file..., this might take a while");

    try {
      if (uploadMethod === "link") {
        await axios.post("/archives", { year, issue, journal, file: link });
      } else {
        if (existing?.file && !existing.file.startsWith("http")) {
          await axios.delete("/supabase/delete", {
            data: { filePath: existing.file },
          });
        }
        const formData = new FormData();
        formData.append("file", file);
        const { data, error } = await axios.post("/supabase/upload", formData);
        const url = data?.url;
        if (error) throw new Error("Upload failed");

        const filePath = url.split("/").pop();
        setStatusText("Saving archive...");

        await axios.post("/archives", { year, issue, journal, file: filePath });
      }

      showMessage("Archive created");
      setIssue("");
      setFile(null);
      setLink("");
      setYear("");
      fileInputRef.current.value = null;
      fetchArchives();
    } catch (err) {
      showMessage(err?.message || "Upload failed");
    } finally {
      setConfirm({ open: false, action: null, text: "" });
      setUploading(false);
      setStatusText("");
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "500px", margin: "auto" }}>
      {confirm.open && (
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
      )}

      {message && (
        <div
          style={{
            top: "10px",
            right: "10px",
            padding: "10px",
            backgroundColor: "#333",
            color: "white",
            borderRadius: "4px",
            zIndex: 9999,
            borderBottom: `3px solid #3b82f6`,
            backgroundImage: `linear-gradient(to left, #3b82f6 ${progress}%, transparent ${progress}%)`,
            backgroundPosition: "bottom",
            backgroundSize: "100% 3px",
            backgroundRepeat: "no-repeat",
          }}
        >
          {message}
        </div>
      )}

      <h2 style={{ marginBottom: "1rem" }}>Upload Archive</h2>

      {/* Year */}
      <div style={{ marginBottom: "1rem" }}>
        <label>Year:</label>
        <input
          type="number"
          disabled={uploading}
          placeholder="Enter year..."
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
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

      {/* Upload Method */}
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

      <div style={{ marginTop: "2rem" }}>
        <h3>Existing Archives</h3>
        {archives.length === 0 && <p>No archives found.</p>}
        {archives.map((a) => (
          <div
            key={a._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.5rem",
              borderBottom: "1px solid #eee",
            }}
          >
            <span>
              {a.journal} — Vol {getVolume(a.year)}, Issue {a.issue} ({a.year})
            </span>
            <a
              href={
                a.file?.startsWith("http")
                  ? a.file
                  : `${backendBase}/file?url=https://your-supabase-url/storage/v1/object/public/archive/${a.file}`
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.8rem",
                color: "#3b82f6",
                textDecoration: "none",
                marginRight: "8px",
              }}
            >
              View
            </a>
            <button
              onClick={() => handleDelete(a)}
              style={{
                backgroundColor: "#d9534f",
                color: "white",
                border: "none",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmitArchive;
