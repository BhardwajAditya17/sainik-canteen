import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading, logout } = useAuth(); // Assuming logout is available in AuthContext
  const location = useLocation();

  const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    // Only start monitoring if a user is actually logged in
    if (!user) return;

    const checkInactivity = () => {
      const lastActive = localStorage.getItem("lastActiveTime");
      
      if (lastActive) {
        const timeSinceLastActive = Date.now() - parseInt(lastActive);
        
        if (timeSinceLastActive > TIMEOUT_DURATION) {
          // Session expired
          alert("Your session has expired due to inactivity. Please login again.");
          localStorage.removeItem("lastActiveTime");
          logout(); // This clears the user state in AuthContext
        }
      }
    };

    const updateActivity = () => {
      localStorage.setItem("lastActiveTime", Date.now().toString());
    };

    // 1. Check for timeout immediately when the route changes
    checkInactivity();

    // 2. Set up a background interval to check every minute
    const interval = setInterval(checkInactivity, 60000);

    // 3. Listen for user interactions to reset the clock
    const events = ["mousemove", "keypress", "scroll", "click"];
    events.forEach((event) => window.addEventListener(event, updateActivity));

    return () => {
      clearInterval(interval);
      events.forEach((event) => window.removeEventListener(event, updateActivity));
    };
  }, [user, logout]);

  // 1. Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3"></div>
        <div className="text-gray-600 font-medium">Checking permissions...</div>
      </div>
    );
  }

  // 2. Check if User exists AND has 'admin' role
  if (user && user.role === 'admin') {
    return children;
  }

  // 3. Redirect to login if unauthorized
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default AdminRoute;