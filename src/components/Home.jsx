import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import journals from "../data/journals.json";
import welcome from "../assets/welcome.jpg";
import "../styles/home.css";
import Contact from "./Contact";
import JournalCarousel from "../journal/JournalCarousel";
import RecentArticles from "./RecentArticles";
import ReviewCarousel from "./ReviewCarousel";
import { FaArrowRight } from "react-icons/fa";
import { Helmet } from "react-helmet";

const Home = ({ setIsHeroVisible }) => {
  const heroRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const heroBottom = heroRef.current.getBoundingClientRect().bottom;
      setIsHeroVisible(heroBottom - 100 > 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setIsHeroVisible]);

  return (
    <>
      <Helmet>
        <title>Domain Journals - Article submission platform</title>
        <meta
          name="description"
          content="Domain Journals is an article publishing platform where authors can submit research manuscripts and articles for peer-reviewed open access publication."
        />
        <link rel="canonical" href="https://domainjournals.com/" />
      </Helmet>

      <div className="home-wrapper">
        <div className="hero-banner" ref={heroRef}>
          <img src={welcome} alt="Welcome" className="hero-image" />
          <div className="hero-text">
            <h1 className="typing">Discover. Inspire. Innovate.</h1>
            <h2>Welcome to Domain Journals</h2>
            <p>
              Your open-source gateway to groundbreaking research. From
              cutting-edge Health Studies and Life-changing Biology
              breakthroughs to the latest in Science & Technology and
              thought-provoking Multidisciplinary insights — every article is a
              window into tomorrow's innovations.
            </p>
            <Link to="/journals" className="hero-button">
              Start Exploring ↓
            </Link>
          </div>
        </div>

        <JournalCarousel journals={journals} />

        <section className="cta-section">
          <p className="cta-eyebrow">Open access publishing</p>
          <h2>Contribute to the advancement of knowledge</h2>
          <p className="cta-body">
            Submit your research to Domain Journals and join a global community
            of authors shaping the next era of discovery.
          </p>
          <div className="cta-actions">
            <button
              className="cta-btn-primary"
              onClick={() => navigate("/submit")}
            >
              Submit a manuscript
            </button>
            <Link to="/signup" className="cta-btn-secondary">
              Become an author
            </Link>
          </div>
        </section>

        <section className="reviews-section">
          <h2>Author reviews</h2>
          <ReviewCarousel />
        </section>

        <section className="cards-section">
          <div className="card" onClick={() => navigate("publication-ethics")}>
            <h2>Publication ethics</h2>
            <p>
              Prior to submission, please visit the journal catalog and the
              instructions for authors sections.
            </p>
            <span className="card-link">
              View more <FaArrowRight />
            </span>
          </div>
          <div className="card" onClick={() => navigate("review-process")}>
            <h2>Review process</h2>
            <p>
              Peer review is a fundamental step towards ensuring the standards
              and quality of scientific publication.
            </p>
            <span className="card-link">
              View more <FaArrowRight />
            </span>
          </div>
          <div className="card" onClick={() => navigate("support")}>
            <h2>Support Domain Journals</h2>
            <p>
              We follow the Open Access Policy, allowing free online
              availability of articles immediately upon publication.
            </p>
            <span className="card-link">
              View more <FaArrowRight />
            </span>
          </div>
        </section>

        <RecentArticles />
        <Contact home={true} />
      </div>
    </>
  );
};

export default Home;
