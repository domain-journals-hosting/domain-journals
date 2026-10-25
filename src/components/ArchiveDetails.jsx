import { FaDownload, FaEye } from "react-icons/fa";
import "../styles/archiveDetails.css";
import { getViewerUrl, getDownloadUrl } from "../utils/fileHelpers";

const ArchiveDetails = ({ file, fileUrl }) => {
  const targetUrl = fileUrl || file;
  if (!targetUrl) return null;

  const viewerLink = getViewerUrl(targetUrl);
  const downloadLink = getDownloadUrl(targetUrl);

  return (
    <div className="archive-details">
      <div className="archive-details__actions">
        <a
          className="archive-details__btn archive-details__btn--view"
          href={viewerLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaEye /> View issue
        </a>
        <a
          className="archive-details__btn archive-details__btn--download"
          href={downloadLink}
          download
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaDownload /> Download
        </a>
      </div>
    </div>
  );
};

export default ArchiveDetails;