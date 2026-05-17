import { useEffect, useRef, useState, useCallback } from "react";
import axios from "../api/axios";
import useScreenSize from "../hooks/useScreenSize";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import "../styles/reviewCarousel.css";

const ReviewCarousel = () => {
  const isMobile = useScreenSize();
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const isPaused = useRef(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/review");
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      }
    };
    fetch();
  }, []);

  const goTo = useCallback((index) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
    }, 250);
  }, []);

  const prev = () => goTo(current === 0 ? reviews.length - 1 : current - 1);

  const next = useCallback(
    () => goTo((current + 1) % reviews.length),
    [current, reviews.length, goTo],
  );

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      if (!isPaused.current) next();
    }, 10000);
    return () => clearInterval(interval);
  }, [next, reviews.length]);

  const handleTouchStart = useRef(null);

  const onTouchStart = (e) => {
    handleTouchStart.current = e.changedTouches[0].clientX;
  };

  const onTouchEnd = (e) => {
    const distance = handleTouchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(distance) > 50) distance > 0 ? next() : prev();
  };

  if (!reviews.length) return null;

  const review = reviews[current];

  return (
    <div
      className="review-carousel"
      onMouseEnter={() => (isPaused.current = true)}
      onMouseLeave={() => (isPaused.current = false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {!isMobile && (
        <button
          className="review-arrow left"
          onClick={prev}
          aria-label="Previous review"
        >
          <i className="ti ti-chevron-left" aria-hidden="true" />
        </button>
      )}

      <div className={`review-card${fading ? " fading" : ""}`}>
        <img
          src={review?.profilePicture || defaultAvatar}
          alt={review?.name || "Author"}
          className="review-avatar"
        />
        <p className="review-text">&quot;{review?.text}&quot;</p>
        <span className="review-name">— {review?.name}</span>
      </div>

      {!isMobile && (
        <button
          className="review-arrow right"
          onClick={next}
          aria-label="Next review"
        >
          <i className="ti ti-chevron-right" aria-hidden="true" />
        </button>
      )}

      <div className="review-dots">
        {reviews.map((_, idx) => (
          <span
            key={idx}
            className={`dot${idx === current ? " active" : ""}`}
            onClick={() => goTo(idx)}
            role="button"
            tabIndex={0}
            aria-label={`Review ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewCarousel;
