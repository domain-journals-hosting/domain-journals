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

      {isMobile && (
        <>
          {isOpened ? (
            <FaTimes onClick={toggleMenu} className="journal-toggle-icon" />
          ) : (
            <FaBars onClick={toggleMenu} className="journal-toggle-icon" />
          )}

          {isOpened && (
            <>
              <div className="journal-overlay" onClick={toggleMenu} />
              <div className="journal-drawer">
                <ul>
                  {links.map(({ label, to }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        className={location.pathname === to ? "active" : ""}
                        onClick={toggleMenu}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </>
      )}

      <BreadCrumbs slug={slug} />
    </nav>
  );
};

export default JournalHeader;
