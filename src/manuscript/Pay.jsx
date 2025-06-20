import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

const Pay = () => {
  const { manuscriptId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handlePayment = async () => {
      try {
        const response = await axios.post(`/pay/manuscript/${manuscriptId}`);
        if (response?.data?.url) {
          window.location.href = response.data.url;
        } else {
          setError("Payment link not received.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to initiate payment.");
      } finally {
        setLoading(false);
      }
    };

    handlePayment();
  }, [manuscriptId]);

  return (
    <div style={styles.container}>
      {loading && <p style={styles.text}>Redirecting to payment page...</p>}
      {error && <p style={{ ...styles.text, color: "crimson" }}>{error}</p>}
    </div>
  );
};

export default Pay;

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: "1.1rem",
    fontWeight: 500,
  },
};
