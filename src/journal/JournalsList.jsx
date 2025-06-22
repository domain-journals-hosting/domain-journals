import { useState } from "react";
import { Link } from "react-router-dom";
import journals from "../data/journals.json";
import "../styles/journalsList.css";
import health from "../assets/health.jpg";
import biological from "../assets/biological.jpg";
import multidisciplinary from "../assets/multidisciplinary.jpg";
import scienceImage from "../assets/science.jpg";

const source = (string) =>
  string === "health"
    ? health
    : string === "biological"
    ? biological
    : string === "multidisciplinary"
    ? multidisciplinary
    : scienceImage;

const JournalsList = () => {
  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (slug) => {
    setExpanded((prev) => (prev === slug ? null : slug));
  };

  return (
    <div className="journal-container">
      {journals.map((journalObject) => {
        const isActive = expanded === journalObject.slug;
        return (
          <div className="journal" key={journalObject.slug}>
            <div className="image-wrapper">
              <img src={source(journalObject.image)} alt="" />
              <button
                className="expand-btn"
                onClick={() => toggleExpand(journalObject.slug)}
              >
                {isActive ? "✖" : "➕"}
              </button>

              {isActive && (
                <div className="overlay-actions">
                  <Link to={journalObject.slug}>Home</Link>
                  <Link to={`${journalObject.slug}/editorial-board`}>
                    Editorial board
                  </Link>
                  <Link to={`${journalObject.slug}/current-issue`}>
                    Current issue
                  </Link>
                </div>
              )}
            </div>
            <h2>{journalObject.title}</h2>
            <p>{journalObject.description.substring(0, 300)}...</p>
          </div>
        );
      })}
    </div>
  );
};

export default JournalsList;
