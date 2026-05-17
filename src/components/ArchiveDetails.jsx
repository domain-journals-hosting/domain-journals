import { FaDownload, FaEye } from "react-icons/fa";
import "../styles/archiveDetails.css";

const backendBase = "https://api.domainjournals.com";

const ArchiveDetails = ({ file, fileUrl }) => {
  if (!file) return null;

  const isLink = file.startsWith("http://") || file.startsWith("https://");
  const downloadUrl = `${backendBase}/file?url=${fileUrl}`;

  return (
    <div className="archive-details">
      <div className="archive-details__actions">
        <a
          className="archive-details__btn archive-details__btn--view"
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaEye /> View issue
        </a>
        {!isLink && (
          <a
            className="archive-details__btn archive-details__btn--download"
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaDownload /> Download
          </a>
        )}
      </div>
    </div>
  );
};

export default ArchiveDetails;
