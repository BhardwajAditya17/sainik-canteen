import axios from "axios";

const api = axios.create({
  // Use the environment variable on Render; fallback to local for dev
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
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
      
      // 1. Clear all security/auth data
      localStorage.removeItem("token");
      localStorage.removeItem("lastActiveTime"); // Sync with your session timeout logic
      localStorage.removeItem("rememberedAdminEmail"); // Optional: clear on forced logout
      
      // 2. Only redirect if we aren't already on the login page to avoid loops
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;