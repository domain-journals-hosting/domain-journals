import { useEffect, useRef } from "react";
import { FaCheckCircle } from "react-icons/fa";
import "../styles/success.css";

const Success = () => {
  const successRef = useRef(null);

  useEffect(() => {
    successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <div className="success-box">
      <FaCheckCircle className="success-icon" />
      <p ref={successRef}>Action successful</p>
      <a href="/" className="home-link">
        Go back home
      </a>
    </div>
  );
};

export default Success;
