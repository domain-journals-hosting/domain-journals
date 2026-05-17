import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import journals from "../data/journals.json";
import "../styles/journalsList.css";
import health from "../assets/health.jpg";
import biological from "../assets/biological.jpg";
import multidisciplinary from "../assets/multidisciplinary.jpg";
import scienceImage from "../assets/science.jpg";
import { Helmet } from "react-helmet";

const imageMap = {
  health,
  biological,
  multidisciplinary,
  science: scienceImage,
};

const JournalsList = () => {
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();
  const delayRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(delayRef.current);
  }, []);

  const handleMouseEnter = (slug) => {
    clearTimeout(delayRef.current);
    delayRef.current = setTimeout(() => setExpanded(slug), 500);
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
          content="Explore all journals under Domain Journals, including Domain Health Journal, Journal of Science and Technology, Biological Sciences and Multidisciplinary."
        />
        <link rel="canonical" href="https://domainjournals.com/journals" />
      </Helmet>

      <div className="journals-page">
        <div className="journals-page__header">
          <h1>All Domain Journals</h1>
          <p>
            Explore our peer-reviewed open access journals across multiple
            disciplines.
          </p>
        </div>

        <div className="journal-container">
          {journals.map((journalObject) => {
            const isActive = expanded === journalObject.slug;
            return (
              <div className="journal-card" key={journalObject.slug}>
                <div
                  className="journal-card__image-wrapper"
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    src={imageMap[journalObject.image]}
                    alt={journalObject.title}
                  />
                  <button
                    className={`journal-card__expand-btn${isActive ? " active" : ""}`}
                    onClick={() => toggleExpand(journalObject.slug)}
                    onMouseEnter={() => handleMouseEnter(journalObject.slug)}
                    aria-label={isActive ? "Close menu" : "Open menu"}
                  >
                    <i
                      className={`ti ${isActive ? "ti-x" : "ti-plus"}`}
                      aria-hidden="true"
                    />
                  </button>

                  {isActive && (
                    <div className="journal-card__overlay">
                      <Link to={journalObject.slug}>
                        <i className="ti ti-home" aria-hidden="true" /> Home
                      </Link>
                      <Link to={`${journalObject.slug}/editorial-board`}>
                        <i className="ti ti-users" aria-hidden="true" />{" "}
                        Editorial board
                      </Link>
                      <Link to={`${journalObject.slug}/current-issue`}>
                        <i className="ti ti-book" aria-hidden="true" /> Current
                        issue
                      </Link>
                    </div>
                  )}
                </div>

                <div
                  className="journal-card__body"
                  onClick={() => navigate(journalObject.slug)}
                >
                  <h2 className="journal-card__title">{journalObject.title}</h2>
                  <p className="journal-card__desc">
                    {journalObject.description.substring(0, 200)}...
                  </p>
                  <span className="journal-card__link">
                    <i className="ti ti-arrow-right" aria-hidden="true" /> Visit
                    journal
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default JournalsList;
