import { useEffect, useState } from "react";
import axios from "../api/axios";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/course/payments");
      console.log(res.data);
      setPayments(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (id) => {
    try {
      const response = await axios.patch(`course/${id}`);
      console.log(response.data);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to confirm payment");
    }
  };

  const deletePayment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?"))
      return;
    try {
      await axios.delete(`/course/${id}`);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete payment");
    }
  };

  if (loading) return <p>Loading payments...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Payments</h2>
      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>User</th>
            <th>Course</th>
            <th>Paid At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.length &&
            payments.map((p) => (
              <tr key={p._id}>
                <td>{p.user?.name || "Unknown"}</td>
                <td>{p.course?.title || "Unknown Course"}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td>
                  {!p.confirmed && (
                    <>
                      <button onClick={() => confirmPayment(p._id)}>
                        Confirm
                      </button>
                      <button
                        onClick={() => deletePayment(p._id)}
                        style={{ marginLeft: "10px" }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan="4">No payments yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Payments;
