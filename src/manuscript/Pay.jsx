import { useParams } from "react-router-dom";
import axios from "../api/axios";

const Pay = () => {
  const { manuscriptId } = useParams();
  console.log("Here");
  const handlePayment = async () => {
    try {
      const response = await axios.post(`/pay/${manuscriptId}`);
      if (response?.data?.url) {
        window.location.href = response.data.url;
      } else {
        alert("Payment link not received.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to initiate payment.");
    }
  };

  return (
    <button
      onClick={handlePayment}
      style={{
        background: "blue",
        color: "white",
        padding: "10px 20px",
        borderRadius: "5px",
      }}
    >
      💳 Pay Now
    </button>
  );
};

export default Pay;
