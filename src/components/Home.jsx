import journals from "../data/journals.json";
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/home.css";
import logo from "../assets/logo.jpg";
import { Link, useNavigate } from "react-router-dom";
import Contact from "./Contact";
import { useEffect, useState } from "react";
import JournalCarousel from "../journal/JournalCarousel";
import useScreenSize from "../hooks/useScreenSize";
import RecentArticles from "./RecentArticles";
import ReviewCarousel from "./ReviewCarousel";

const Home = () => {
  const isMobile = useScreenSize();
  const navigate = useNavigate();

  const truncate = (str, n) =>
    str.length > n ? str.substr(0, n - 1) + "…" : str;

  return (
    <div className="home-wrapper">
      <JournalCarousel journals={journals} />

      <article>
        <h3>
          <Link to={"/signup"}>Become an author?</Link>
        </h3>

        <h3>Contribute to the advancement of knowledge</h3>
        <button
          style={{ margin: "20px", padding: "20px", borderRadius: "25px" }}
          onClick={() => navigate("/submit")}
        >
          Submit a manuscript?
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
