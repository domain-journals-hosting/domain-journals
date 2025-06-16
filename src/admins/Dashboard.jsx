import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuthor";
import { useUser } from "../hooks/useUser";

const Dashboard = () => {
  const { user } = useUser();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}</p>
      <Link to="/admin/invite">Invite Member</Link>
    </div>
  );
};

export default Dashboard;
