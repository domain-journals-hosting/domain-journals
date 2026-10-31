import { createContext, useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setChecked(true);
      const currentPath = window.location.pathname + window.location.search;
      navigate("/login", { state: { from: currentPath }, replace: true });
    };

    window.addEventListener("author:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("author:unauthorized", handleUnauthorized);
  }, [navigate]);

  const login = (userData) => {
    setUser(userData);
    setChecked(true);
  };

  const logout = () => {
    setUser(null);
    setChecked(true);
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await axios.get("author/me", {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (err) {
        if (!err.response) {
          setError("No server response");
        } else {
          setError(err.message);
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
      const response = await axios.post("/author/reset", { email });
      setUser((prev) => ({ ...prev, _id: response.data.userId }));
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Something went wrong" };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, checked, login, logout, error, setUser, sendResetMail }}
    >
      {children}
    </AuthContext.Provider>
  );
};
