import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // 1. Remember Me: Load saved email on component mount
    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedAdminEmail");
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);

            // 2. Remember Me Logic: Save or Remove email (NOT password)
            if (rememberMe) {
                localStorage.setItem("rememberedAdminEmail", email);
            } else {
                localStorage.removeItem("rememberedAdminEmail");
            }

            // 3. Session Timeout Anchor: Mark the login time
            // This allows the app to know when the session started
            localStorage.setItem("lastActiveTime", Date.now().toString());

            navigate("/dashboard");
        } catch (err) {
            setError("Invalid admin credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 relative overflow-hidden font-sans">
            {/* Decorative blobs */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-emerald-200 rounded-full blur-2xl opacity-30" />
                <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-emerald-300 rounded-full blur-2xl opacity-30" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="mx-auto h-20 w-20 rounded-xl flex items-center justify-center mb-4">
                        <img src="/SKLogo.png" alt="Sainik Canteen Logo" className="h-20 w-20 object-contain" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Admin Portal</h2>
                    <p className="text-sm text-gray-600 mt-1">Sign in to manage your store</p>
                </div>

                {/* Card */}
                <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center animate-pulse">
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                    Remember me
                                </span>
                            </label>
                            <button type="button" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-3 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}