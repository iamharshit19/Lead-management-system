import axios from "axios";

const api = axios.create({
  baseURL: "https://lead-management-system-jsmm.onrender.com/api", 
  withCredentials: true 
});

export default api;
