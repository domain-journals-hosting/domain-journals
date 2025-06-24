import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import journals from "../data/journals.json";
import welcome from "../assets/welcome.jpg";
import "../styles/home.css";
import Contact from "./Contact";
import JournalCarousel from "../journal/JournalCarousel";
import useScreenSize from "../hooks/useScreenSize";
import RecentArticles from "./RecentArticles";
import ReviewCarousel from "./ReviewCarousel";
import { FaArrowRight } from "react-icons/fa";

const Home = ({ setIsHeroVisible }) => {
  const heroRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const heroBottom = heroRef.current.getBoundingClientRect().bottom;
      const offset = 100; // show nav only after 100px past bottom
      setIsHeroVisible(heroBottom - offset > 0);
    };

    handleScroll(); // run initially
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setIsHeroVisible]);

  return (
    <div className="home-wrapper">
      <div className="hero-banner" ref={heroRef}>
        <img src={welcome} alt="Welcome" className="hero-image" />
        <div className="hero-text">
          <h1 className="typing">Discover. Inspire. Innovate.</h1>
          <p>
            Welcome to Domain Journals, your open-source gateway to
            groundbreaking research. From cutting-edge Health Studies and
            Life-changing Biology breakthroughs to the latest in Science &
            Technology and thought-provoking Multidisciplinary insights, every
            article is a window into tomorrow’s innovations. Dive in, explore
            freely, and join a global community shaping the next era of
            knowledge.
          </p>
          <Link to="/journals" className="hero-button">
            Start Exploring ↓
          </Link>
        </div>
      </div>

      <JournalCarousel journals={journals} />

      <article>
        <h3>
          <Link to={"/signup"}>Become an author?</Link>
        </h3>
        <hr style={{ padding: "20px" }} />
        <h3>Contribute to the advancement of knowledge</h3>
        <button
          style={{ margin: "20px", padding: "20px", borderRadius: "25px" }}
          onClick={() => navigate("/submit")}
        >
          Submit a manuscript
        </button>
        <h2>Authors reviews</h2>
        <ReviewCarousel />
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

      <RecentArticles />
      <Contact />
    </div>
  );
};

export default Home;
