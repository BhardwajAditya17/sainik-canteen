import axios from "axios";

const api = axios.create({
  // Use environment variable if available, otherwise default to localhost
  baseURL: typeof process !== 'undefined' && process.env.REACT_APP_API_URL 
    ? process.env.REACT_APP_API_URL 
    : 'http://localhost:5001/api',
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
    // Check if token expired (401 Unauthorized)
    if (error.response?.status === 401) {
      console.warn("Token expired or invalid. Logging out...");
      localStorage.removeItem("token");
      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;