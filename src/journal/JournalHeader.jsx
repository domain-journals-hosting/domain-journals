import { Link, useLocation } from "react-router-dom";
import "../styles/journalHeader.css";
import useScreenSize from "../hooks/useScreenSize";
import { FaFileAlt } from "react-icons/fa";
import { useState } from "react";

const JournalHeader = ({ slug }) => {
  const isMobile = useScreenSize(400);
  const [isOpened, setIsOpened] = useState(false);
  const location = useLocation();
  const toggleMenu = () => setIsOpened((prev) => !prev);
  const links = [
    { label: "Journal Home", to: `/journals/${slug}` },
    { label: "Editorial board", to: `/journals/${slug}/editorial-board` },
    { label: "Current issue", to: `/journals/${slug}/current-issue` },
    { label: "Guidelines", to: `/journals/${slug}/guidelines` },
    { label: "Archive", to: `/journals/${slug}/archive` },
  ];

  return (
    <nav className="journal-header">
      {!isMobile && (
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
      )}
      {isMobile && <FaFileAlt onClick={toggleMenu} />}
      {isMobile && isOpened && (
        <ul style={{ display: "flex", flexDirection: "column" }}>
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
      )}
    </nav>
  );
};

export default JournalHeader;
