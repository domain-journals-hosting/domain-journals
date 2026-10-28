import { Link } from "react-router-dom";
import { FaCompass, FaHome, FaUser } from "react-icons/fa";
import { useSeoMeta } from "@unhead/react";
import "../styles/404.css";

const Missing = () => {
  useSeoMeta({
    title: "404 - Page Not Found | Domain Journals",
    description:
      "The requested resource could not be found on Domain Journals.",
    robots: "noindex, nofollow",
  });

  return (
    <div className="missing-wrapper">
      <div className="missing-card">
        <div className="missing-icon-wrapper">
          <FaCompass />
        </div>
        <h1 className="missing-code">404</h1>
        <h2 className="missing-title">Page Not Found</h2>
        <p className="missing-text">
          The manuscript resource, article, or page you requested does not exist
          or may have been moved.
        </p>

        <div className="missing-actions">
          <Link to="/" className="missing-btn-primary">
            <FaHome /> Go Home
          </Link>
          <Link to="/author" className="missing-btn-outline">
            <FaUser /> Author Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Missing;
