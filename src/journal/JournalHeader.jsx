import { Link, useLocation } from "react-router-dom";
import "../styles/journalHeader.css";
import useScreenSize from "../hooks/useScreenSize";

const JournalHeader = ({ slug }) => {
  const isMobile = useScreenSize(400);
  const location = useLocation();

  const links = [
    { label: "Journal Home", to: `/journals/${slug}` },
    { label: "Editorial board", to: `/journals/${slug}/editorial-board` },
    { label: "Current issue", to: `/journals/${slug}/current-issue` },
    { label: "Guidelines", to: `/journals/${slug}/guidelines` },
    { label: "Archive", to: `/journals/${slug}/archive` },
  ];

  return (
    !isMobile && (
      <nav className="journal-header">
        <ul>
          {links.map(({ label, to }) => (
            <li key={to}>
              <Link
                to={to}
                className={location.pathname === to ? "active" : ""}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    )
  );
};

export default JournalHeader;
