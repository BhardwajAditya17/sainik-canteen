import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me", {
           headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user", err);
        handleClearAuth();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleClearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastActiveTime");
    setUser(null);
  };

  // ✅ Login Function Updated
  // Changed parameter from 'email' to 'identifier'
  const login = async (identifier, password) => {
    // We must send 'identifier' in the body to match backend: 
    // const { identifier, password } = req.body;
    const res = await api.post("/auth/login", { identifier, password });
    
    const token = res.data.token;
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("lastActiveTime", Date.now().toString());
    }
    
    setUser(res.data.user);
    return res;
  };

  const logout = () => {
    handleClearAuth();
  };

  // ✅ Register Function
  const register = async (data) => {
    // 'data' now contains: name, email, password, phone, address, city, state, pincode
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