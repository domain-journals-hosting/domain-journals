import axios from "axios";

export default axios.create({
  // "https://api.domainjournals.com",
  baseURL: "http://localhost:3500",
  timeout: 20000,
  withCredentials: true,
});
