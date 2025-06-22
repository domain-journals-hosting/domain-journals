import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:3500",
  // "https://domain-journals-backend.onrender.com",
  timeout: 20000,
  withCredentials: true,
});
