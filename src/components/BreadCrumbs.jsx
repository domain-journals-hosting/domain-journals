import { Link } from "react-router-dom";
import { FaHome, FaChevronRight } from "react-icons/fa";
import "../styles/breadCrumbs.css";

const BreadCrumbs = ({ slug }) => {
  const reverseSlug = (slug) =>
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="breadcrumb">
      <Link to="/" className="breadcrumb-link">
        <FaHome /> Home
      </Link>
      <FaChevronRight className="breadcrumb-icon" />
      <Link to="/journals" className="breadcrumb-link">
        Domain Journals
      </Link>
      <FaChevronRight className="breadcrumb-icon" />
      <span className="breadcrumb-current">{reverseSlug(slug)}</span>
    </div>
  );
};

export default BreadCrumbs;
