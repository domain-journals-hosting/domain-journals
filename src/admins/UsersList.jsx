import { useEffect, useState } from "react";
import axios from "../api/axios";
import UserExcerpt from "./UserExcerpt";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const getAllUsers = async () => {
      try {
        const response = await axios.get("/admin");
        setUsers(response.data);
        console.log(response);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    getAllUsers();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Users List</h2>
      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : users.length === 0 ? (
        <p style={styles.empty}>No users found.</p>
      ) : (
        users.map((user) => (
          <UserExcerpt key={user._id} user={user} setUsers={setUsers} />
        ))
      )}
    </div>
  );
};

export default UsersList;

const styles = {
  container: {
    maxWidth: 700,
    margin: "40px auto",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  heading: {
    fontSize: "1.8rem",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  loading: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#666",
  },
  empty: {
    textAlign: "center",
    color: "#999",
  },
};
