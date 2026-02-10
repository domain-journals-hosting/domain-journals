import { FaCheck, FaTrashAlt } from "react-icons/fa";

const PaymentItem = ({ payment, confirmPayment, deletePayment }) => {
  const isMobile = window.matchMedia("(max-width: 450px)").matches;

  return (
    <div
      style={{
        padding: 10,
      }}
    >
      <h3>{payment.user?.name || "Unknown"}</h3>
      <p>{payment.user?.email}</p>
      <p>Account Name: {payment.accountName}</p>
      <p>{payment.course?.title || "Unknown Course"}</p>
      <p>{new Date(payment.createdAt).toLocaleString()}</p>
      {payment.receipt ? (
        <img
          src={payment.receipt}
          alt="receipt"
          width={280}
          style={{
            borderRadius: 20,
            marginTop: 10,
          }}
        />
      ) : (
        "No receipt"
      )}
      <div
        style={{
          margin: 20,
          display: "flex",
          gap: 30,
          maxWidth: 300,
          justifyContent: "space-evenly",
        }}
      >
        <FaTrashAlt
          onClick={() =>
            deletePayment(payment._id, payment.user.name, payment.course?.title)
          }
          style={{
            fontSize: "20",
            color: "red",
            cursor: "pointer",
          }}
        />

        {!payment.confirmed ? (
          <FaCheck
            style={{
              color: "green",
              marginRight: "20px",
              marginBottom: isMobile ? "40px" : 0,
              fontSize: "20",
            }}
            onClick={() =>
              confirmPayment(
                payment._id,
                payment.user.name,
                payment.course?.title,
              )
            }
          />
        ) : (
          "Confirmed"
        )}
      </div>

      <hr />
    </div>
  );
};

export default PaymentItem;
