import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import journals from "../data/journals.json";
import "../styles/journalsList.css";
import health from "../assets/health.jpg";
import biological from "../assets/biological.jpg";
import multidisciplinary from "../assets/multidisciplinary.jpg";
import scienceImage from "../assets/science.jpg";
import { Helmet } from "react-helmet";

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
  const navigate = useNavigate();
  const delayRef = useRef(null);
  useEffect(() => {
    return () => clearTimeout(delayRef.current);
  }, []);
  const handleMouseEnter = (slug) => {
    clearTimeout(delayRef.current);
    delayRef.current = setTimeout(() => {
      setExpanded(slug);
    }, 500);
  };

  const handleMouseLeave = () => {
    clearTimeout(delayRef.current);
    setExpanded(null);
  };

  const toggleExpand = (slug) => {
    clearTimeout(delayRef.current);
    setExpanded((prev) => (prev === slug ? null : slug));
  };

  return (
    <>
      <Helmet>
        <title>Journals - Domain Journals</title>
        <meta
          name="description"
          content="Explore all journals under Domain Journals, including Domain Health Journal, Journal of Science and Technlology, Biological sciences and Multidisciplinary."
        />
        <link rel="canonical" href="https://domainjournals.com/journals" />
      </Helmet>
      <h1 style={{ textAlign: "center", marginTop: "20px" }}>
        All Domain Journals
      </h1>

      <div className="journal-container" style={{ paddingTop: "70px" }}>
        {journals.map((journalObject) => {
          const isActive = expanded === journalObject.slug;
          return (
            <div className="journal" key={journalObject.slug}>
              <div className="image-wrapper">
                <img src={source(journalObject.image)} alt="" />
                <button
                  className="expand-btn"
                  onClick={() => toggleExpand(journalObject.slug)}
                  onMouseEnter={() => handleMouseEnter(journalObject.slug)}
                >
                  {isActive ? "✖" : "➕"}
                </button>

                {isActive && (
                  <div
                    className="overlay-actions"
                    onMouseLeave={handleMouseLeave}
                  >
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
              <h2 onClick={() => navigate(`${journalObject.slug}`)}>
                {journalObject.title}
              </h2>
              <p onClick={() => navigate(`${journalObject.slug}`)}>
                {journalObject.description.substring(0, 300)}...
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default JournalsList;
