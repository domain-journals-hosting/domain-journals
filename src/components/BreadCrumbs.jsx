import { Link } from "react-router-dom";
import { FaHome, FaChevronRight } from "react-icons/fa";
import "../styles/breadCrumbs.css";

const reverseSlug = (slug) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const BreadCrumbs = ({ slug }) => {
  return (
    <div className="breadcrumb">
      <Link to="/" className="breadcrumb-link">
        <FaHome /> Home
      </Link>
      <FaChevronRight className="breadcrumb-sep" />
      <Link to="/journals" className="breadcrumb-link">
        Journals
      </Link>
      <FaChevronRight className="breadcrumb-sep" />
      <span className="breadcrumb-current">{reverseSlug(slug)}</span>
    </div>
  );
};

export default BreadCrumbs;
