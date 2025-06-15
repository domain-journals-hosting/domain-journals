import { useState } from "react";
import { FaBars } from "react-icons/fa";
import logo from "../assets/logo.jpg";
import { Link } from "react-router-dom";
import "../styles/nav.css";
import useScreenSize from "../hooks/useScreenSize";

const Nav = () => {
  const isMobile = useScreenSize();
  const [isOpened, setIsOpened] = useState(false);
  const toggleMenu = () => setIsOpened((prev) => !prev);
  return (
    <>
      <div className="nav-wrapper">
        <img src={logo} alt="Domain journals" width={100} />
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
        </nav>
      )}
    </>
  );
};

export default Nav;
