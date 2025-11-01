import { useState } from "react";
import "../styles/paymentModal.css";
import axios from "../api/axios";

const PaymentModal = ({ course, open, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const paymentURL = `/course/pay/${course._id}`;

  const sendPayment = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post(paymentURL);
      console.log(response);
      setSubmitted(true);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        {!submitted ? (
          <>
            <h2>{course.title}</h2>
            <p className="price">Price: ₦{course.price}</p>

            <div className="account">
              <h4>Naira Account</h4>
              <p>
                Account Number: <b>5601542840</b>
              </p>
              <p>
                Account Name: <b>Domain Publishers Limited</b>
              </p>
              <p>Bank: Fidelity Bank</p>
            </div>

            <div className="account">
              <h4>Dollar Account</h4>
              <p>
                Account Number: <b>5250520305</b>
              </p>
              <p>
                Account Name: <b>Domain Publishers Limited</b>
              </p>
              <p>Include your name in the narration while transfering</p>
            </div>

            {error && <p className="error">{error}</p>}

            <button
              className="submit-btn"
              onClick={sendPayment}
              disabled={loading}
            >
              {loading ? "Processing..." : "I have sent the money"}
            </button>
          </>
        ) : (
          <div className="submitted">
            <h3>We’re looking into it ✅</h3>
            <p>
              Please send a mail to{" "}
              <a href="mailto:nelson.ejumedia@domainjournals.com">
                nelson.ejumedia@domainjournals.com
              </a>{" "}
              or <a
  href={`https://wa.me/2349046887416?text=${encodeURIComponent(
    `Hello, I’ve just made a payment for *${course.title}*. I’m attaching my receipt for your confirmation. Thank you.`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
>
  Forward your receipt to us on WhatsApp
</a>{" "}
              to fasten up the process.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
