import { createContext, useEffect, useState } from "react";
import axios from "../api/axios";
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(null);

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
        const response = await axios.get("admin/me", {
          withCredentials: true,
        });
        setUser(response.data);
        console.log(response);
      } catch (err) {
        setError(err.message);
        console.log(err.message);
        setUser(null);
      } finally {
        setChecked(true);
      }
    };
    checkUser();
  }, []);

  const sendResetMail = async (email = user.email) => {
    try {
      const response = await axios.post("/admin/reset", {
        email,
      });
      console.log(response.data);
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
