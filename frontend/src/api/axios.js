import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3002",
  withCredentials: true, // ⭐ MUST
});

export default api;