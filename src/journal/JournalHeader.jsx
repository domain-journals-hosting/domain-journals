import { Link, useLocation } from "react-router-dom";
import "../styles/journalHeader.css";
import useScreenSize from "../hooks/useScreenSize";
import { FaBars, FaTimes } from "react-icons/fa";
import { useState } from "react";
import BreadCrumbs from "../components/BreadCrumbs";

const JournalHeader = ({ slug }) => {
  const isMobile = useScreenSize();
  const [isOpened, setIsOpened] = useState(false);
  const location = useLocation();

  const links = [
    { label: "Journal Home", to: `/journals/${slug}` },
    { label: "Editorial board", to: `/journals/${slug}/editorial-board` },
    { label: "Current issue", to: `/journals/${slug}/current-issue` },
    { label: "Guidelines", to: `/journals/${slug}/guidelines` },
    { label: "Archive", to: `/journals/${slug}/archive` },
  ];

  return (
    <nav className="journal-header">
      {!isMobile ? (
        <ul className="journal-header__links">
          {links.map(({ label, to }) => (
            <li key={to}>
              <Link
                to={to}
                className={`journal-header__link${location.pathname === to ? " active" : ""}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <button
          className="journal-toggle-btn"
          onClick={() => setIsOpened((p) => !p)}
          aria-label="Toggle menu"
        >
          {isOpened ? <FaTimes /> : <FaBars />}
        </button>
      )}

      {isMobile && isOpened && (
        <>
          <div className="journal-overlay" onClick={() => setIsOpened(false)} />
          <div className="journal-drawer">
            <ul>
              {links.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`journal-drawer__link${location.pathname === to ? " active" : ""}`}
                    onClick={() => setIsOpened(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <BreadCrumbs slug={slug} />
    </nav>
  );
};

export default JournalHeader;
