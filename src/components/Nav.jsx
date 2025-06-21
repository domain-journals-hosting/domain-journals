import { useRef, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "../styles/nav.css";
import useScreenSize from "../hooks/useScreenSize";
import { useAuth } from "../hooks/useAuthor";
import { useUser } from "../hooks/useUser";

const Nav = () => {
  const isMobile = useScreenSize();
  const iconRef = useRef(null);
  const location = useLocation();

  const [isOpened, setIsOpened] = useState(false);
  const { user } = useAuth();
  const admin = useUser();
  const toggleMenu = () => {
    setIsOpened((prev) => !prev);
    if (iconRef.current) {
      iconRef.current.classList.remove("animate-icon");
      void iconRef.current.offsetWidth; // force reflow
      iconRef.current.classList.add("animate-icon");
    }
  };

  if (location.pathname.startsWith("/journals/")) {
    return;
  }
  return (
    <>
      <div className="nav-wrapper">
        <h2>Domain Journals</h2>
        {!isMobile && (
          <nav className="big-screen">
            <Link to="/">
              <li>Home</li>
            </Link>
            <Link to="/journals">
              <li>Journals</li>
            </Link>
            <Link to="/submit">
              <li>Submit manuscript</li>
            </Link>
            <Link to="/contact">
              <li>Contact us</li>
            </Link>
            {admin.user && (
              <Link to="/admin/dashboard">
                <li>Dashboard</li>
              </Link>
            )}

            {!user && !admin.user && (
              <Link to="/signup">
                <li>Sign up</li>
              </Link>
            )}
            {!user && !admin.user && (
              <Link to="/login">
                <li>Log in</li>
              </Link>
            )}
            {user && (
              <Link to={`/author`}>
                <li>View profile</li>
              </Link>
            )}
          </nav>
        )}
        {isMobile && (
          <div className="icon-wrapper" onClick={toggleMenu} ref={iconRef}>
            {isOpened ? <FaTimes /> : <FaBars />}
          </div>
        )}
      </div>
      {isOpened && isMobile && (
        <nav>
          <Link to="/">
            <li>Home</li>
          </Link>
          <Link to="/journals">
            <li>Journals</li>
          </Link>
          <Link to="/submit">
            <li>Submit manuscript</li>
          </Link>
          <Link to="/contact">
            <li>Contact us</li>
          </Link>
          {admin.user && (
            <Link to="/admin/dashboard">
              <li>Dashboard</li>
            </Link>
          )}

          {!user && !admin.user && (
            <Link to="/signup">
              <li>Sign up</li>
            </Link>
          )}
          {!user && !admin.user && (
            <Link to="/login">
              <li>Log in</li>
            </Link>
          )}
          {user && (
            <Link to={`/author`}>
              <li>View profile</li>
            </Link>
          )}
        </nav>
      )}
    </>
  );
};

export default Nav;
