import React from "react";

const UserExcerpt = ({ user }) => {
  const formattedDate = new Date(user.createdAt).toLocaleDateString();

  return (
    <div style={styles.container}>
      <img
        src={user.profilePicture || "/src/assets/defaultAvatar.jpg"}
        alt={`${user.name}'s avatar`}
        style={styles.avatar}
      />
      <div>
        <p style={styles.name}>{user.name}</p>
        <p style={styles.role}>
          Role: <strong>{user.role}</strong>
          {user.role === "editor" && user.access
            ? ` (Access: ${user.access})`
            : " (Domain Journals Admin)"}
        </p>
        <p style={styles.date}>Joined: {formattedDate}</p>
      </div>
    </div>
  );
};

export default UserExcerpt;

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    objectFit: "cover",
    marginRight: 15,
  },
  name: {
    margin: 0,
    fontWeight: "600",
    fontSize: "1rem",
  },
  role: {
    margin: "4px 0",
    color: "#555",
  },
  date: {
    fontSize: "0.85rem",
    color: "#888",
  },
};
