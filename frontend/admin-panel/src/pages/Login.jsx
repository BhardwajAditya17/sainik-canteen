import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
// Changed Mail icon to User icon to represent Email/Phone more broadly
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
    // 1. Changed 'email' to 'identifier' to match updated AuthContext and Backend
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const savedIdentifier = localStorage.getItem("rememberedAdminIdentifier");
        if (savedIdentifier) {
            setIdentifier(savedIdentifier);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 2. Pass 'identifier' instead of 'email' to match backend { identifier, password }
            await login(identifier, password);

            if (rememberMe) {
                localStorage.setItem("rememberedAdminIdentifier", identifier);
            } else {
                localStorage.removeItem("rememberedAdminIdentifier");
            }

            // Session Timeout Anchor
            localStorage.setItem("lastActiveTime", Date.now().toString());

            navigate("/dashboard");
        } catch (err) {
            // Updated error message to be more inclusive
            setError(err.response?.data?.error || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 relative overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-emerald-200 rounded-full blur-2xl opacity-30" />
                <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-emerald-300 rounded-full blur-2xl opacity-30" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-6">
                    <div className="mx-auto h-20 w-20 rounded-xl flex items-center justify-center mb-4">
                        <img src="/SKLogo.png" alt="Sainik Canteen Logo" className="h-20 w-20 object-contain" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Admin Portal</h2>
                    <p className="text-sm text-gray-600 mt-1">Sign in to manage your store</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center animate-pulse">
                                {error}
                            </div>
                        )}

                        {/* Identifier (Email or Phone) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone Number</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text" // Changed to text to allow phone number digits
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="Enter email or phone"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
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