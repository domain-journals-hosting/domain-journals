import { useState } from "react";
import "../styles/paymentModal.css";
import axios from "../api/axios";
import { useAuth } from "../hooks/useAuthor";
import SubmitReceipt from "./SubmitReceipt";
import { useNavigate } from "react-router-dom";

const PaymentModal = ({ course, open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const openForm = () => setShowSubmitForm(true);
  if (!open) return null;

  const paymentURL = `/course/pay/${course._id}`;

  const sendPayment = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post(paymentURL, { receipt, accountName });
      console.log({ receipt, accountName });
      console.log(response);
      alert("Submission success");
      onclose();
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

  const message = `${user.name} payment for ${course.title}`;
  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    window.alert("Copied");
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        {showSubmitForm && (
          <SubmitReceipt
            message={message}
            setReceipt={setReceipt}
            setAccountName={setAccountName}
            accountName={accountName}
            sendPayment={sendPayment}
            loading={loading}
            error={error}
          />
        )}

        {!showSubmitForm && (
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
            </div>

            <p>Include this in the narration while transfering</p>

            <div
              style={{
                border: "2px solid #333",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              <button
                style={{
                  width: "50px",
                  marginLeft: "calc(100% - 50px)",
                  backgroundColor: "#333",
                  color: "white",
                }}
                onClick={copyMessage}
              >
                Copy
              </button>
              {message}
            </div>
            <p>
              Please do not use the same account to pay for more than one
              person!!!
            </p>
            {error && <p className="error">{error}</p>}

            <button className="submit-btn" onClick={openForm}>
              {loading ? "Processing..." : "I have sent the money"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
