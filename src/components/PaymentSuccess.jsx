import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "../api/axios";

const PaymentSuccess = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const reference = query.get("reference") || query.get("trxref");

  const [manuscriptId, setManuscriptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchManuscript = async () => {
      try {
        const { data } = await axios.get(`/manuscript/verify/${reference}`);
        setManuscriptId(data._id);
      } catch (err) {
        console.error(err);
        setError(
          "We couldn't verify your payment automatically. Please check your status manually."
        );
      } finally {
        setLoading(false);
      }
    };

    if (reference) fetchManuscript();
    else setLoading(false);
  }, [reference]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>✅ Payment Successful</h2>
        <p style={styles.text}>
          Thank you for your payment. Your transaction was successful... We'll
          get back to you through email as soon as possible
        </p>

        {reference && (
          <p style={styles.reference}>
            <strong>Reference:</strong> {reference}
          </p>
        )}

        {loading ? (
          <p style={styles.text}>Verifying payment...</p>
        ) : error ? (
          <p style={{ ...styles.text, color: "crimson" }}>{error}</p>
        ) : manuscriptId ? (
          <div style={styles.actions}>
            <Link to="/" style={styles.button}>
              🏠 Go to Home
            </Link>
            <Link
              to={`/status/${manuscriptId}`}
              style={{ ...styles.button, backgroundColor: "#2196F3" }}
            >
              📄 Check Manuscript Status
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentSuccess;

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
  },
  title: {
    color: "green",
    marginBottom: "10px",
  },
  text: {
    marginBottom: "20px",
    color: "#555",
  },
  reference: {
    backgroundColor: "#f4f4f4",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "20px",
    fontFamily: "monospace",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  button: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 15px",
    borderRadius: "5px",
    textDecoration: "none",
    display: "inline-block",
  },
};
