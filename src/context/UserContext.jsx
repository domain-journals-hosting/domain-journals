import { createContext, useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const login = (userData) => {
    setUser(userData);
    setChecked(true);
  };

  const logout = () => {
    setUser(null);
    setChecked(true);
  };

  useEffect(() => {
    const handleAdminUnauthorized = () => {
      setUser(null);
      setChecked(true);
      const currentPath = window.location.pathname + window.location.search;
      navigate("/admin/login", { state: { from: currentPath }, replace: true });
    };

    window.addEventListener("admin:unauthorized", handleAdminUnauthorized);
    return () =>
      window.removeEventListener("admin:unauthorized", handleAdminUnauthorized);
  }, [navigate]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await axios.get("admin/me", {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (err) {
        if (!err.response) {
          setError("No server response");
        } else {
          setError(err?.response?.data?.error || "Something went wrong");
        }
        setUser(null);
      } finally {
        setChecked(true);
      }
    };
    checkUser();
  }, []);

  const sendResetMail = async (email = user?.email) => {
    try {
      const response = await axios.post("/admin/reset", { email });
      setUser((prev) => ({ ...prev, _id: response.data.userId }));
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Something went wrong" };
    }
  };

  return (
    <UserContext.Provider
      value={{ user, checked, login, logout, error, setUser, sendResetMail }}
    >
      {children}
    </UserContext.Provider>
  );
};
