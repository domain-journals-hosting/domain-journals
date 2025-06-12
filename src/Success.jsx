import { FaCheckCircle } from "react-icons/fa";
import "./styles/success.css";

const Success = () => {
  return (
    <div className="success-box">
      <FaCheckCircle className="success-icon" />
      <p>Submission successful, you should receive a confirmation email soon</p>

      <a href="/" className="home-link">
        Go back home
      </a>
    </div>
  );
};

export default Success;
