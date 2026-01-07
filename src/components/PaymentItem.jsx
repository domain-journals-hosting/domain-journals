import React from "react";
import { FaCheck, FaTrashAlt } from "react-icons/fa";

const PaymentItem = ({ payment, confirmPayment, deletePayment }) => {
  const isMobile = window.matchMedia("(max-width: 450px)").matches;

  return (
    <div>
      <p>{payment.user?.name || "Unknown"}</p>
      <p>{payment.course?.title || "Unknown Course"}</p>
      <p>{new Date(payment.createdAt).toLocaleString()}</p>
      <img src={payment.receipt} alt="receipt" width={280} />
      <p>{payment.accountName}</p>
      <p>
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
                payment.course?.title
              )
            }
          />
        ) : (
          "Confirmed"
        )}
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
      </p>
    </div>
  );
};

export default PaymentItem;
