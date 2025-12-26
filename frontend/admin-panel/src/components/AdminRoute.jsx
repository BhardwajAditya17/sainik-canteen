import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    if (!user) return;

    const checkInactivity = () => {
      const lastActive = localStorage.getItem("lastActiveTime");
      if (lastActive) {
        const timeSinceLastActive = Date.now() - parseInt(lastActive);
        if (timeSinceLastActive > TIMEOUT_DURATION) {
          alert("Your session has expired due to inactivity. Please login again.");
          localStorage.removeItem("lastActiveTime");
          logout();
        }
      }
    };

    const updateActivity = () => {
      localStorage.setItem("lastActiveTime", Date.now().toString());
    };

    checkInactivity();
    const interval = setInterval(checkInactivity, 60000);

    const events = ["mousemove", "keypress", "scroll", "click"];
    events.forEach((event) => window.addEventListener(event, updateActivity));

    return () => {
      clearInterval(interval);
      events.forEach((event) => window.removeEventListener(event, updateActivity));
    };
  }, [user, logout]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3"></div>
        <div className="text-gray-600 font-medium">Checking permissions...</div>
      </div>
    );
  }

  // ✅ MAINTAINED FUNCTIONALITY WITH FIX:
  // We check for 'ADMIN' or 'admin' to prevent the silent redirect loop.
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  if (user && isAdmin) {
    return children;
  }

  // If we are here, it means the user logged in but is NOT an admin.
  // We send them back to login, but we log why so you can see it in the console.
  if (user && !isAdmin) {
      console.warn(`Access Denied: User ${user.phone} has role ${user.role}, but ADMIN is required.`);
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default AdminRoute;