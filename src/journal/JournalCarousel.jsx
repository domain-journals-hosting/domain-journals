import { useState, useEffect, useRef } from "react";
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
  const [fading, setFading] = useState(false);
  const navigate = useNavigate();
  const isPaused = useRef(false);

  const goTo = (index) => {
    setFading(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setFading(false);
    }, 250);
  };

  const prevJournal = () =>
    goTo(currentIndex === 0 ? journals.length - 1 : currentIndex - 1);

  const nextJournal = () => goTo((currentIndex + 1) % journals.length);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused.current) goTo((currentIndex + 1) % journals.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, journals.length]);

  if (!journals.length) return null;
  const currentJournal = journals[currentIndex];

  return (
    <div className="carousel-wrapper">
      <div
        className="journal-carousel"
        onMouseEnter={() => (isPaused.current = true)}
        onMouseLeave={() => (isPaused.current = false)}
      >
        {!isMobile && (
          <button
            className="carousel-arrow left"
            onClick={prevJournal}
            aria-label="Previous journal"
          >
            <i className="ti ti-chevron-left" aria-hidden="true" />
          </button>
        )}

        <div
          className={`journal-frame${fading ? " fading" : ""}`}
          onClick={() => navigate(`/journals/${slug(currentJournal.title)}`)}
          role="button"
          tabIndex={0}
        >
          <h2>{currentJournal.title}</h2>
          <img
            src={imageMap[currentJournal.image]}
            alt={currentJournal.title}
            className="journal-full-image"
          />
        </div>

        {!isMobile && (
          <button
            className="carousel-arrow right"
            onClick={nextJournal}
            aria-label="Next journal"
          >
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="carousel-dots">
        {journals.map((_, idx) => (
          <span
            key={idx}
            className={`dot${idx === currentIndex ? " active" : ""}`}
            onClick={() => goTo(idx)}
            role="button"
            tabIndex={0}
            aria-label={`Go to journal ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default JournalCarousel;
