import axios from "axios";

export default axios.create({
  baseURL: "https://api.domainjournals.com",
  //"http://localhost:3500",
  timeout: 20000,
  withCredentials: true,
});
