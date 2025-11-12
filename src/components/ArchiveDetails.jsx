import { getPdfUrl } from "../components/supabaseUpload";
import { FaDownload } from "react-icons/fa";

const backendBase = "https://api.domainjournals.com";

const ArchiveDetails = ({ file }) => {
  if (!file) return null;

  const isFullUrl = file.startsWith("http://") || file.startsWith("https://");
  const fullUrl = isFullUrl ? file : getPdfUrl(file);

  const downloadUrl = `${backendBase}/files/download?url=${encodeURIComponent(
    fullUrl
  )}`;
  const text = isFullUrl ? "View" : "Download Full Issue";
  const link = isFullUrl ? downloadUrl : fullUrl;
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <a
          style={styles.downloadBtn}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text} <FaDownload style={{ marginLeft: "6px" }} />
        </a>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: "#e6f4ea", // light green background
    border: "1px solid #a7d7a3", // soft green border
    borderRadius: "10px",
    padding: "1rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  downloadBtn: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#34a853", // strong green
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "0.95rem",
    textDecoration: "none",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.2s ease",
  },
  downloadBtnHover: {
    backgroundColor: "#2c8e44",
    transform: "translateY(-1px)",
  },
};

export default ArchiveDetails;
