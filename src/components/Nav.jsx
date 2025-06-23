import { useRef, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "../styles/nav.css";
import useScreenSize from "../hooks/useScreenSize";
import { useAuth } from "../hooks/useAuthor";
import { useUser } from "../hooks/useUser";

const Nav = ({ isHeroVisible }) => {
  const isMobile = useScreenSize(800);
  const iconRef = useRef(null);
  const location = useLocation();
  const { user } = useAuth();
  const admin = useUser();

  const [isOpened, setIsOpened] = useState(false);
  const [visibleLinks, setVisibleLinks] = useState([]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/journals", label: "Journals" },
    { to: "/submit", label: "Submit manuscript" },
    { to: "/contact", label: "Contact us" },
  ];

  if (admin.user) links.push({ to: "/admin/dashboard", label: "Dashboard" });
  if (!user && !admin.user) {
    links.push({ to: "/signup", label: "Sign up" });
    links.push({ to: "/login", label: "Log in" });
  }
  if (user) links.push({ to: "/author", label: "View profile" });

  const toggleMenu = () => {
    const opening = !isOpened;
    setIsOpened(opening);
    if (opening) {
      let current = [];
      links.forEach((_, i) => {
        setTimeout(() => {
          current = [...links.slice(0, i + 1)];
          setVisibleLinks(current);
        }, (300 / links.length) * i);
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
  return (
    <>
      <div
        className="nav-wrapper"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          backgroundColor: isHeroVisible || (isHeroVisible && "transparent"),
        }}
      >
        <h1 style={{ whiteSpace: "nowrap" }}>Domain Journals</h1>
        {!isMobile ? (
          <nav className="big-screen">
            {links.map((item) => (
              <Link to={item.to} key={item.to}>
                <li>{item.label}</li>
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
        <nav
          className="mobile show"
          style={{
            backgroundColor: isHeroVisible && "black",
            marginTop: "4.2rem",
          }}
        >
          {visibleLinks.map((item) => (
            <Link
              to={item.to}
              key={item.to}
              style={{
                transition: "all 0.3s ease",
                opacity: 1,
                transform: "translateY(0)",
              }}
              onClick={() => {
                setIsOpened(false);
                setVisibleLinks([]);
              }}
            >
              <li>{item.label}</li>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
};

export default Nav;
