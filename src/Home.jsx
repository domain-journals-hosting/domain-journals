import journals from "./journals";
import { FaArrowRight } from "react-icons/fa";
import "./styles/home.css";
import logo from "./assets/logo.jpg";
import { useNavigate } from "react-router-dom";
import Contact from "./Contact";
const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home-wrapper">
      <h1>Domain journals</h1>
      <ol>
        {journals.map((journal, index) => (
          <li key={index}>{journal}</li>
        ))}
      </ol>

      <button onClick={() => navigate("/submit")}>Submit a manuscript?</button>

      <article>
        <h2>Authors reviews</h2>
        <img src={logo} alt="" width={100} style={{ borderRadius: "50%" }} />
        <p>
          This is an example of a review... Reviews will probably be gotten from
          the backend
        </p>
      </article>

      <section>
        <div className="card">
          <h2>Publication ethics</h2>
          <p>
            Prior to the submission of the manuscript for consideration, please
            visit the journal catalog and the instructions for the author
            sections.
          </p>
          <p onClick={() => navigate("publication-ethics")}>
            View more <FaArrowRight />
          </p>
        </div>
        <div className="card">
          <h2>Review process</h2>
          <p>
            Peer review is a fundamental step towards ensuring the standards and
            quality of the scientific publication.
          </p>
          <p onClick={() => navigate("review-process")}>
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
          <p onClick={() => navigate("support")}>
            View more <FaArrowRight />
          </p>{" "}
        </div>
      </section>

      <Contact />
    </div>
  );
};

export default Home;
