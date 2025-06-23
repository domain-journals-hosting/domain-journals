import axios from "axios";

export default axios.create({
  //"http://localhost:3500",
  baseURL: "https://domain-journals-backend.onrender.com",
  timeout: 20000,
  withCredentials: true,
});
