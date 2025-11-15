import axios from "axios";

export default axios.create({
  // baseURL: "http://10.186.146.156:3500",
  // baseURL: "http://localhost:3500",
  baseURL: "https://api.domainjournals.com",

  timeout: 20000,
  withCredentials: true,
});
