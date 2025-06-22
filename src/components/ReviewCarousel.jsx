import { useEffect, useRef, useState, useCallback } from "react";
import axios from "../api/axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import useScreenSize from "../hooks/useScreenSize";
import defaultAvatar from "../assets/defaultAvatar.jpg";

const ReviewCarousel = () => {
  const isMobile = useScreenSize();
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const carouselInterval = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

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

  const handleSlide = useCallback(
    (dir) => {
      if (isAnimating || reviews.length <= 1) return;
      setDirection(dir);
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent((prev) =>
          dir === "right"
            ? (prev + 1) % reviews.length
            : (prev - 1 + reviews.length) % reviews.length
        );
        setDirection(null);
        setIsAnimating(false);
      }, 500);
    },
    [isAnimating, reviews.length]
  );

  useEffect(() => {
    carouselInterval.current = setInterval(() => {
      handleSlide("right");
    }, 10000);
    return () => clearInterval(carouselInterval.current);
  }, [handleSlide]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > 50) {
      handleSlide(distance > 0 ? "right" : "left");
    }
  };

  const nextIndex = (current + 1) % reviews.length;
  const prevIndex = (current - 1 + reviews.length) % reviews.length;

  const activeReviews = direction
    ? direction === "right"
      ? [reviews[current], reviews[nextIndex]]
      : [reviews[prevIndex], reviews[current]]
    : [reviews[current]];

  const translateValue = direction
    ? direction === "right"
      ? "-100%"
      : "0%"
    : "0%";
  if (!reviews.length) return <p>No reviews to show </p>;
  return (
    <div
      className="reviews-carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "relative",
        maxWidth: 600,
        overflow: "visible",
        margin: "50px auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!isMobile && (
        <button
          onClick={() => handleSlide("left")}
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            fontSize: 24,
            zIndex: 1,
            cursor: "pointer",
          }}
        >
          <FaChevronLeft />
        </button>
      )}

      <div
        className="track"
        style={{
          display: "flex",
          overflow: "visible",
          width: `${activeReviews.length * 100}%`,
          transform: `translateX(${translateValue})`,
          transition: direction ? "transform 0.5s ease-in-out" : "none",
        }}
      >
        {activeReviews.map((review, idx) => (
          <div
            key={idx}
            className="review-wrapper"
            style={{
              justifySelf: "center",
              width: "100%",
              flex: "100%",
              position: "relative",
              overflow: "visible",
            }}
          >
            <img
              src={review?.profilePicture || defaultAvatar}
              alt="Author avatar"
              className="floating-avatar"
              width={80}
              height={80}
              style={{
                borderRadius: "50%",
                position: "absolute",
                top: "-40px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            />

            <div
              className="review-card"
              style={{
                background: "#f9f9f9",
                borderRadius: 10,
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                padding: "50px 20px 20px",
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 25% 100%, 0% 75%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                backgroundColor: "#659377",
                width: "100%",
                position: "relative",
              }}
            >
              <p
                style={{
                  color: " #F1F8E9",
                  margin: "20px 0",
                  fontStyle: "italic",
                  fontSize: 20,
                  textAlign: "center",
                }}
              >
                {review?.text}
              </p>
              <p
                style={{
                  color: "#093238",
                  position: "absolute",
                  right: "20px",
                  bottom: "15px",
                  fontWeight: "800",
                }}
              >
                - {review?.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!isMobile && (
        <button
          onClick={() => handleSlide("right")}
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            fontSize: 24,
            zIndex: 1,
            cursor: "pointer",
          }}
        >
          <FaChevronRight />
        </button>
      )}
    </div>
  );
};

export default ReviewCarousel;
