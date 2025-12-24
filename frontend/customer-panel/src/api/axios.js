import axios from "axios";

// This checks for Vite (VITE_API_URL) or CRA (REACT_APP_API_URL)
// If neither exists, it defaults to localhost for development
const BASE_URL = process.env?.REACT_APP_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});

// Automatically attach token to each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// HANDLE EXPIRED TOKEN
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired or invalid. Logging out...");
      
      // Clean up all auth data
      localStorage.removeItem("token");
      localStorage.removeItem("lastActiveTime"); // Important for your timeout logic
      
      // Only redirect if we aren't already on the login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;