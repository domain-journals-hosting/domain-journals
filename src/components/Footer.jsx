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
