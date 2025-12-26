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

  const login = async (identifier, password) => {
  try {
    const res = await api.post("/auth/login", { identifier, password });
    const { token, user: userData } = res.data;
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("lastActiveTime", Date.now().toString());
      setUser(userData);
    }
    return res;
  } catch (error) {
    throw error;
  }
};

  // ✅ ADDED THIS BACK (It was missing in your snippet)
  const logout = () => {
    handleClearAuth();
  };

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