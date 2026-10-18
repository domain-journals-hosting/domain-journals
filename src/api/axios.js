import axios from "axios";

export default axios.create({
  // baseURL: "http://10.186.146.156:3500",
  baseURL: import.meta.VITE_API_BASE_URL,
  // baseURL: "https://api.domainjournals.com",

  timeout: 40000,
  withCredentials: true,
});
