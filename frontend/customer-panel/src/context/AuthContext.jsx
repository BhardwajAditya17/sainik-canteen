import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on startup
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // We set the header manually here for the initial check 
        // to ensure the startup fetch is authorized
        const res = await api.get("/auth/me", {
           headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user", err);
        handleClearAuth(); // Clean up if token is expired/invalid
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Helper to clear all auth-related data
  const handleClearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastActiveTime");
    setUser(null);
  };

  // ✅ Login Function
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    
    const token = res.data.token;
    if (token) {
      localStorage.setItem("token", token);
      
      // Initialize the session activity timer immediately upon login
      localStorage.setItem("lastActiveTime", Date.now().toString());
    }
    
    setUser(res.data.user);
    return res;
  };

  // ✅ Logout Function
  const logout = () => {
    handleClearAuth();
  };

  // ✅ Register Function
  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    const token = res.data.token;
    if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("lastActiveTime", Date.now().toString());
    }
    setUser(res.data.user);
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);