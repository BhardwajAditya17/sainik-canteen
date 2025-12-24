import React, { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, logout } = useContext(AuthContext);
  const location = useLocation();

  // Session timeout duration (e.g., 30 minutes)
  const TIMEOUT_DURATION = 30 * 60 * 1000; 

  useEffect(() => {
    // Only monitor activity if the user is logged in
    if (!user) return;

    const checkInactivity = () => {
      const lastActive = localStorage.getItem("lastActiveTime");
      if (lastActive) {
        const timeSinceLastActive = Date.now() - parseInt(lastActive);
        if (timeSinceLastActive > TIMEOUT_DURATION) {
          // Session expired logic
          alert("Your session has expired due to inactivity. Please login again to continue shopping.");
          logout();
        }
      }
    };

    const updateActivity = () => {
      localStorage.setItem("lastActiveTime", Date.now().toString());
    };

    // Check immediately on route change
    checkInactivity();

    // Background check every minute
    const interval = setInterval(checkInactivity, 60000);

    // Listen for interaction events
    const events = ["mousemove", "keypress", "scroll", "click", "touchstart"];
    events.forEach((event) => window.addEventListener(event, updateActivity));

    return () => {
      clearInterval(interval);
      events.forEach((event) => window.removeEventListener(event, updateActivity));
    };
  }, [user, logout]);

  // 1. Handle the initial auth-check loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading your account...</p>
        </div>
      </div>
    );
  }

  // 2. If no user, redirect to login but save the current location 
  // so they return to the page they were trying to visit (e.g., Checkout)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}