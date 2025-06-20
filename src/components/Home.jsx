import journals from "../data/journals.json";
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/home.css";
import logo from "../assets/logo.jpg";
import { useNavigate } from "react-router-dom";
import Contact from "./Contact";
import { useState } from "react";
import JournalCarousel from "../journal/JournalCarousel";

const reviewsFromBackend = [
  {
    id: 1,
    author: "Jane Doe",
    text: "Excellent platform for scientific publications. Quick review process!",
  },
  {
    id: 2,
    author: "John Smith",
    text: "Very supportive editors and smooth submission workflow.",
  },
  {
    id: 3,
    author: "Alice Johnson",
    text: "High quality journals with broad readership and impact.",
  },
  {
    id: 4,
    author: "Michael Brown",
    text: "Great experience publishing my research here. Highly recommended!",
  },
  {
    id: 5,
    author: "Emily Davis",
    text: "The peer review is fair and timely. I appreciated the detailed feedback.",
  },
];

const MAX_VISIBLE = 3;

const Home = () => {
  const navigate = useNavigate();

  const [startIndex, setStartIndex] = useState(0);

  const handlePrev = () => {
    setStartIndex((prev) =>
      prev === 0 ? reviewsFromBackend.length - MAX_VISIBLE : prev - 1
    );
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      prev + MAX_VISIBLE >= reviewsFromBackend.length ? 0 : prev + 1
    );
  };

  const visibleReviews = [];
  for (let i = 0; i < MAX_VISIBLE; i++) {
    visibleReviews.push(
      reviewsFromBackend[(startIndex + i) % reviewsFromBackend.length]
    );
  }

  const truncate = (str, n) =>
    str.length > n ? str.substr(0, n - 1) + "…" : str;

  return (
    <div className="home-wrapper">
      <JournalCarousel journals={journals} />

      <article>
        <p>Become an author</p>
        <button onClick={() => navigate("/submit")}>
          Submit a manuscript?
        </button>
        <h2>Authors reviews</h2>
        <div className="reviews-carousel" style={{ position: "relative" }}>
          <button
            onClick={handlePrev}
            aria-label="Previous reviews"
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              color: "#333",
              padding: 0,
            }}
          >
            <FaChevronLeft />
          </button>

          <div
            className="reviews-list"
            style={{
              display: "flex",
              gap: 20,
              overflow: "hidden",
              width: "80vw",
              maxWidth: 700,
              margin: "0 auto",
              padding: "10px 40px",
            }}
          >
            {visibleReviews.map((review) => (
              <div
                key={review.id}
                className="review-card"
                style={{
                  flex: "0 0 100%",
                  background: "#f9f9f9",
                  padding: 15,
                  borderRadius: 8,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  minHeight: 120,
                }}
              >
                <img
                  src={logo}
                  alt="Author avatar"
                  width={60}
                  style={{ borderRadius: "50%", marginBottom: 10 }}
                />
                <p style={{ fontStyle: "italic", fontSize: 14 }}>
                  {truncate(review.text, 120)}
                </p>
                <p
                  style={{
                    marginTop: 8,
                    fontWeight: "bold",
                    fontSize: 14,
                    textAlign: "right",
                  }}
                >
                  - {review.author}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next reviews"
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              color: "#333",
              padding: 0,
            }}
          >
            <FaChevronRight />
          </button>
        </div>
      </article>

      <section>
        <div className="card">
          <h2>Publication ethics</h2>
          <p>
            Prior to the submission of the manuscript for consideration, please
            visit the journal catalog and the instructions for the author
            sections.
          </p>
          <p
            onClick={() => navigate("publication-ethics")}
            style={{ cursor: "pointer" }}
          >
            View more <FaArrowRight />
          </p>
        </div>
        <div className="card">
          <h2>Review process</h2>
          <p>
            Peer review is a fundamental step towards ensuring the standards and
            quality of the scientific publication.
          </p>
          <p
            onClick={() => navigate("review-process")}
            style={{ cursor: "pointer" }}
          >
            View more <FaArrowRight />
          </p>
        </div>
        <div className="card">
          <h2>Support</h2>
          <p>
            Domain journals Publishers follows the Open Access Policy of
            publication, which allows free online availability and access of
            articles, immediately upon publication.
          </p>
          <p onClick={() => navigate("support")} style={{ cursor: "pointer" }}>
            View more <FaArrowRight />
          </p>
        </div>
      </section>

      <Contact />
    </div>
  );
};

export default Home;
