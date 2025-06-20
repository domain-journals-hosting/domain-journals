import { useState } from "react";
import { FaBars } from "react-icons/fa";
import logo from "../assets/logo.jpg";
import { Link } from "react-router-dom";
import "../styles/nav.css";
import useScreenSize from "../hooks/useScreenSize";
import { useAuth } from "../hooks/useAuthor";
import { useUser } from "../hooks/useUser";

const Nav = () => {
  const isMobile = useScreenSize();
  const [isOpened, setIsOpened] = useState(false);
  const { user } = useAuth();
  const admin = useUser();
  const toggleMenu = () => setIsOpened((prev) => !prev);
  return (
    <>
      <div className="nav-wrapper">
        <h2>Domain journals</h2>
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
        {isMobile && <FaBars onClick={toggleMenu} />}
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
