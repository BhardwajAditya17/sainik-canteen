import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
// 1. Added Eye and EyeOff imports here
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // 2. Added state for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // 1. Remember Me: Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedCustomerEmail");
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);

      // 2. Remember Me Logic: Save or Remove email
      if (rememberMe) {
        localStorage.setItem("rememberedCustomerEmail", form.email);
      } else {
        localStorage.removeItem("rememberedCustomerEmail");
      }

      // 3. Session Timeout Anchor: Mark the start of the session
      localStorage.setItem("lastActiveTime", Date.now().toString());

      navigate("/");
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.error || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-24 w-24 flex items-center justify-center mb-4">
            <img src="/SKLogo.png" alt="Sainik Canteen Logo" className="h-20 w-20 object-contain" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your Sainik Canteen account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-pulse">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={onChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition sm:text-sm"
                placeholder="Email address"
              />
            </div>

            {/* Password Field Updated */}
            <div className="relative">
              {/* Left Lock Icon */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>

              {/* Input */}
              <input
                name="password"
                // 3. Dynamic type based on state
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={onChange}
                // 4. Added pr-10 for right padding so text doesn't overlap icon
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition sm:text-sm"
                placeholder="Password"
              />

              {/* 5. Right Eye Toggle Button */}
              <button
                type="button" // Important: prevent form submission
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mr-2 cursor-pointer"
              />
              <span className="group-hover:text-gray-900 transition-colors">Remember me</span>
            </label>
            <Link to="#" className="font-medium text-emerald-600 hover:text-emerald-500">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:bg-gray-400 transition-colors shadow-lg hover:shadow-emerald-500/30"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* Register */}
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500 underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;