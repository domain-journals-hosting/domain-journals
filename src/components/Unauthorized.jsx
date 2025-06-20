import React from "react";

const Unauthorized = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Unauthorized</h1>
      <p style={styles.message}>
        You do not have permission to access this page.
      </p>
    </div>
  );
};

export default Unauthorized;

const styles = {
  container: {
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#b00020",
    backgroundColor: "#fdecea",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "20px",
    borderRadius: "8px",
    margin: "40px auto",
    maxWidth: "400px",
    boxShadow: "0 4px 10px rgba(176, 0, 32, 0.2)",
    textAlign: "center",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
  },
  message: {
    fontSize: "1.1rem",
  },
};
