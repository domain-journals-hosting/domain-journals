import { FaDownload, FaEye } from "react-icons/fa";

const backendBase = "https://api.domainjournals.com";

const ArchiveDetails = ({ file, fileUrl }) => {
  if (!file) return null;

  const isLink = file.startsWith("http://") || file.startsWith("https://");
  const downloadUrl = `${backendBase}/file?url=${fileUrl}`;

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <a
          style={styles.btn("#3b82f6")}
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View <FaEye style={{ marginLeft: "6px" }} />
        </a>
        {!isLink && (
          <a
            style={styles.btn("#34a853")}
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download <FaDownload style={{ marginLeft: "6px" }} />
          </a>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: "#e6f4ea",
    border: "1px solid #a7d7a3",
    borderRadius: "10px",
    padding: "1rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "8px",
  },
  btn: (bg) => ({
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: bg,
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "0.95rem",
    textDecoration: "none",
    cursor: "pointer",
  }),
};

export default ArchiveDetails;
