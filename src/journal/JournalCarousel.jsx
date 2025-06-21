import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { slug } from "../data/journals";

import "../styles/carousel.css";
import healthImg from "../assets/health.jpg";
import biologicalImg from "../assets/biological.jpg";
import multidisciplinaryImg from "../assets/multidisciplinary.jpg";
import scienceImg from "../assets/science.jpg";
import useScreenSize from "../hooks/useScreenSize";

const imageMap = {
  health: healthImg,
  biological: biologicalImg,
  multidisciplinary: multidisciplinaryImg,
  science: scienceImg,
};

const JournalCarousel = ({ journals }) => {
  const isMobile = useScreenSize(600);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % journals.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, [journals.length]);

  const prevJournal = () => {
    setCurrentIndex((prev) => (prev === 0 ? journals.length - 1 : prev - 1));
  };

  const nextJournal = () => {
    setCurrentIndex((prev) => (prev + 1) % journals.length);
  };

  if (!journals.length) return null;
  const currentJournal = journals[currentIndex];

  return (
    <>
      <div className="journal-carousel">
        {!isMobile && (
          <button className="carousel-arrow left" onClick={prevJournal}>
            &#8592;
          </button>
        )}

        <div
          className="journal-frame"
          onClick={() => navigate(`/journals/${slug(currentJournal.title)}`)}
          role="button"
          tabIndex={0}
        >
          <h2>{currentJournal.title}</h2>
          <img
            src={imageMap[currentJournal.image]}
            alt={`${currentJournal.title} logo`}
            className="journal-full-image"
          />
        </div>

        {!isMobile && (
          <button className="carousel-arrow right" onClick={nextJournal}>
            &#8594;
          </button>
        )}
      </div>

      <div className="carousel-dots">
        {journals.map((_, idx) => (
          <span
            key={idx}
            className={`dot ${idx === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(idx)}
            role="button"
            tabIndex={0}
          />
        ))}
      </div>
    </>
  );
};

export default JournalCarousel;
