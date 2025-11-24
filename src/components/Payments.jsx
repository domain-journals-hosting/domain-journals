import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import { FaCheck, FaTrashAlt } from "react-icons/fa";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("");
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [error, setError] = useState("");
  const isMobile = window.matchMedia("(max-width: 450px)").matches;
  console.log(isMobile);
  useEffect(() => {
    fetchPayments();
  }, []);

  const normalize = (str) =>
    (str || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

  function debounce(fn, delay = 250) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
  const debouncedFilter = useRef(
    debounce(
      (
        payments,
        courseFilter,
        statusFilter,
        nameFilter,
        normalize,
        setFiltered
      ) => {
        let result = payments;

        if (courseFilter !== "all") {
          result = result.filter(
            (p) => p.course?.title?.toLowerCase() === courseFilter.toLowerCase()
          );
        }

        if (statusFilter !== "all") {
          result = result.filter(
            (p) => p.confirmed.toString() === statusFilter
          );
        }

        if (nameFilter.trim() !== "") {
          const normalizedQuery = normalize(nameFilter);
          result = result.filter((p) =>
            p._normalizedName.includes(normalizedQuery)
          );
        }

        setFiltered(result);
      },
      250
    )
  ).current;

  useEffect(() => {
    debouncedFilter(
      payments,
      courseFilter,
      statusFilter,
      nameFilter,
      normalize,
      setFilteredPayments
    );
  }, [payments, courseFilter, statusFilter, nameFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/course/payments");
      const prepared = res.data.map((p) => ({
        ...p,
        _normalizedName: normalize(p.user?.name),
      }));
      setPayments(prepared);
      setFilteredPayments(prepared);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (id, name, title) => {
    if (
      !window.confirm(
        "Are you sure you want to confirm this payment " +
          "made by " +
          name +
          " for " +
          title
      )
    )
      return;
    try {
      const response = await axios.patch(`course/${id}`);
      console.log(response.data);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to confirm payment");
    }
  };

  const deletePayment = async (id, name, title) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this payment " +
          "made by " +
          name +
          " for " +
          title
      )
    )
      return;
    try {
      await axios.delete(`/course/payment/${id}`);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete payment");
    }
  };

  if (loading) return <p>Loading payments...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const allCourses = [...new Set(payments.map((p) => p.course?.title))].filter(
    Boolean
  );

  const selectCourseFilter = (
    <select
      name="course"
      id="course"
      value={courseFilter}
      onChange={(e) => setCourseFilter(e.target.value)}
    >
      <option value="all">All</option>
      {allCourses.map((c) => (
        <option value={c.toLowerCase()}>{c}</option>
      ))}
    </select>
  );
  const selectStatusFilter = (
    <select
      name="status"
      id="status"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="all">All</option>
      {[true, false].map((c) => (
        <option value={c}>{c ? "Confirmed" : "Unconfirmed"}</option>
      ))}
    </select>
  );

  const searchNameFilter = (
    <input
      type="text"
      style={{
        maxWidth: "300px",
        padding: "10px",
        display: "block",
      }}
      placeholder="Search name"
      value={nameFilter}
      onChange={(e) => setNameFilter(e.target.value)}
    />
  );
  return (
    <div
      style={{
        overflow: "scroll",
      }}
    >
      <h2>Payments</h2>
      {searchNameFilter}
      {selectCourseFilter}
      {selectStatusFilter}
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
          {filteredPayments.length &&
            filteredPayments.map((p) => (
              <tr key={p._id}>
                <td>{p.user?.name || "Unknown"}</td>
                <td>{p.course?.title || "Unknown Course"}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td>
                  {!p.confirmed && (
                    <FaCheck
                      style={{
                        color: "green",
                        marginRight: "20px",
                        marginBottom: isMobile ? "40px" : 0,
                        fontSize: "20",
                      }}
                      onClick={() =>
                        confirmPayment(p._id, p.user.name, p.course?.title)
                      }
                    />
                  )}
                  <FaTrashAlt
                    onClick={() =>
                      deletePayment(p._id, p.user.name, p.course?.title)
                    }
                    style={{
                      fontSize: "20",
                      color: "red",
                      cursor: "pointer",
                    }}
                  />
                </td>
              </tr>
            ))}
          {filteredPayments.length === 0 && (
            <tr>
              <td colSpan="4">No payments for this category</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Payments;
