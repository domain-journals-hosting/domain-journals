import { useRef, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/nav.css";
import useScreenSize from "../hooks/useScreenSize";
import { useAuth } from "../hooks/useAuthor";
import { useUser } from "../hooks/useUser";
import logo from "../assets/logo.png";

const navIcons = {
  "/": "ti-home",
  "/journals": "ti-books",
  "/submit": "ti-file-upload",
  "/contact": "ti-mail",
  "/admin/dashboard": "ti-layout-dashboard",
  "/signup": "ti-user-plus",
  "/login": "ti-login",
  "/author": "ti-user",
  "/courses": "ti-school",
};

const Nav = ({ isHeroVisible }) => {
  const isMobile = useScreenSize(800);
  const iconRef = useRef(null);
  const location = useLocation();
  const { user, checked } = useAuth();
  const admin = useUser();
  const navigate = useNavigate();

  const [isOpened, setIsOpened] = useState(false);
  const [visibleLinks, setVisibleLinks] = useState([]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/journals", label: "Journals" },
    { to: "/submit", label: "Submit manuscript" },
    { to: "/contact", label: "Contact us" },
  ];

  if (admin.user && admin.checked)
    links.push({ to: "/admin/dashboard", label: "Dashboard" });
  if (!user && !admin.user && checked && admin.checked) {
    links.push({ to: "/signup", label: "Sign up" });
    links.push({ to: "/login", label: "Log in" });
  }
  if (user) {
    links.push({ to: "/author", label: "View profile" });
    links.push({ to: "/courses", label: "Courses" });
  }

  const toggleMenu = () => {
    const opening = !isOpened;
    setIsOpened(opening);
    if (opening) {
      let current = [];
      links.forEach((_, i) => {
        setTimeout(
          () => {
            current = [...links.slice(0, i + 1)];
            setVisibleLinks(current);
          },
          (300 / links.length) * i,
        );
      });
    } else {
      setVisibleLinks([]);
    }

    if (iconRef.current) {
      iconRef.current.classList.remove("animate-icon");
      void iconRef.current.offsetWidth;
      iconRef.current.classList.add("animate-icon");
    }
  };

  if (location.pathname.startsWith("/journals/")) return null;

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      <div
        className={`nav-wrapper no-print${isHeroVisible ? " nav-hero" : ""}`}
      >
        <img
          src={logo}
          alt="Domain Journals"
          width={36}
          height={36}
          onClick={() => navigate("/")}
          className="nav-logo"
        />
        {!isMobile && <span className="nav-brand">Domain Journals</span>}
        {!isMobile ? (
          <nav className="big-screen">
            {links.map((item) => (
              <Link
                to={item.to}
                key={item.to}
                className={`nav-link${item.to === "/submit" ? " nav-link--cta" : ""}${isActive(item.to) ? " nav-link--active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : (
          <div className="icon-wrapper" onClick={toggleMenu} ref={iconRef}>
            {isOpened ? <FaTimes /> : <FaBars />}
          </div>
        )}
      </div>

      {isMobile && isOpened && (
        <nav className={`mobile show${isHeroVisible ? " mobile-hero" : ""}`}>
          {visibleLinks.map((item) => (
            <Link
              to={item.to}
              key={item.to}
              className={`mobile-link${isActive(item.to) ? " mobile-link--active" : ""}`}
              onClick={() => {
                setIsOpened(false);
                setVisibleLinks([]);
              }}
            >
              <i
                className={`ti ${navIcons[item.to] || "ti-circle"}`}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
};

export default Nav;
