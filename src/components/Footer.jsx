import {
  FaXTwitter,
  FaYoutube,
  FaGithub,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa6";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <section className="footer-links">
        <h3 style={{ marginBottom: "0.5rem", color: "#f1f8e9" }}>
          Relevant Links
        </h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>
            <a
              href="/submit"
              style={{ color: "#f1f8e9", textDecoration: "none" }}
            >
              Submit a Manuscript
            </a>
          </li>
          <li>
            <a
              href="/journals"
              style={{ color: "#f1f8e9", textDecoration: "none" }}
            >
              Browse Journals
            </a>
          </li>
          <li>
            <a
              href="/signup"
              style={{ color: "#f1f8e9", textDecoration: "none" }}
            >
              Become an Author
            </a>
          </li>
          <li>
            <a
              href="/contact"
              style={{ color: "#f1f8e9", textDecoration: "none" }}
            >
              Contact Us
            </a>
          </li>
        </ul>
      </section>
      <h3 className="footer-heading">Stay Connected</h3>
      <div className="social-links">
        <a href="https://x.com" target="_blank" rel="noreferrer">
          <FaXTwitter />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noreferrer">
          <FaYoutube />
        </a>
        <a href="https://github.com" target="_blank" rel="noreferrer">
          <FaGithub />
        </a>
        <a href="https://facebook.com" target="_blank" rel="noreferrer">
          <FaFacebookF />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noreferrer">
          <FaLinkedinIn />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
