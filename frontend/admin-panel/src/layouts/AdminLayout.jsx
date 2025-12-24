import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    BarChart3,
    LogOut,
    Menu,
    X,
    UtensilsCrossed,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop state

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Close sidebar automatically when route changes (mobile ux)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const NAV_ITEMS = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/orders", label: "Orders", icon: ShoppingBag },
        { path: "/products", label: "Products", icon: Package },
        { path: "/customers", label: "Customers", icon: Users },
        { path: "/analytics", label: "Analytics", icon: BarChart3 },
    ];

    const isActive = (path) => location.pathname === path;

    // Helper to determine if text should be shown
    // Show text if: Desktop is NOT collapsed OR Mobile Sidebar IS open
    const showText = !isCollapsed || isSidebarOpen;

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">

            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside
                className={`
          fixed md:static inset-y-0 left-0 z-50 
          ${isCollapsed ? "md:w-20" : "md:w-72"} w-72
          bg-emerald-900 shadow-2xl md:shadow-none 
          transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
            >
                {/* Sidebar Header - TOGGLE BUTTON ONLY */}
                <div className="h-20 flex items-center justify-center transition-all duration-300 relative">

                    {/* Desktop Collapse Toggle (Replaces crossed forks) */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex hover:bg-white/10 p-2.5 rounded-xl text-emerald-100 transition-all"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <Menu size={20} />
                    </button>

                    {/* Mobile Branding (Visible only on mobile sidebar) */}
                    <div className="md:hidden flex items-center gap-3 px-6 py-4 w-full">

                        {/* Logo */}
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <img
                                src="/SKLogo.png"
                                alt="Sainik Canteen Logo"
                                className="h-9 w-9 object-contain"
                            />
                        </div>

                        {/* Text */}
                        <div className="leading-tight">
                            <span className="block font-bold text-white tracking-tight">
                                Sainik Canteen
                            </span>
                            <span className="block text-[10px] font-medium text-emerald-300 uppercase tracking-widest">
                                Admin Portal
                            </span>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="ml-auto text-emerald-300 hover:text-white transition-colors p-1"
                            aria-label="Close sidebar"
                        >
                            <X size={24} />
                        </button>
                    </div>

                </div>

                {/* Navigation Links */}
                <nav className={`flex-1 ${!showText ? "px-3" : "px-4"} py-6 space-y-1.5 overflow-y-auto custom-scrollbar transition-all duration-300`}>
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={!showText ? item.label : ""}
                                className={`
                  group flex items-center gap-3 py-3.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${!showText ? "justify-center px-0" : "px-4"}
                  ${active
                                        ? "bg-emerald-800 text-white shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-700/50"
                                        : "text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white"}
                `}
                            >
                                <item.icon
                                    size={20}
                                    className={`flex-shrink-0 transition-colors duration-200 ${active ? "text-white" : "text-emerald-400 group-hover:text-emerald-200"}`}
                                    strokeWidth={active ? 2.5 : 2}
                                />

                                {showText && (
                                    <>
                                        <span className="truncate">{item.label}</span>
                                        {active && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                        )}
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer (User Profile) */}
                <div className={`border-t border-emerald-800/50 bg-emerald-950/30 ${!showText ? "p-3" : "p-4"}`}>
                    <div className={`rounded-2xl bg-emerald-900/50 border border-emerald-800/50 flex flex-col gap-4 ${!showText ? "p-2 items-center" : "p-4"}`}>
                        <div className={`flex items-center ${!showText ? "justify-center" : "gap-3"}`}>
                            <div className="w-10 h-10 rounded-full bg-emerald-800 border border-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                                {user?.name?.charAt(0) || "A"}
                            </div>
                            {showText && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{user?.name || "Admin User"}</p>
                                    <p className="text-xs text-emerald-400 truncate">{user?.email || "admin@store.com"}</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleLogout}
                            title={!showText ? "Sign Out" : ""}
                            className={`flex items-center justify-center gap-2 w-full text-xs font-semibold text-emerald-100 bg-emerald-950 hover:bg-black/40 rounded-lg transition-all shadow-sm hover:shadow active:scale-95 border border-emerald-900 ${!showText ? "p-2" : "px-4 py-2.5"}`}
                        >
                            <LogOut size={16} />
                            {showText && "Sign Out"}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">

                {/* TOP HEADER - EMERALD THEME */}
                <header className="h-20 bg-emerald-900 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 shadow-md">
                    <div className="flex items-center gap-4 flex-1">

                        {/* Mobile Sidebar Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-emerald-100 hover:bg-emerald-800 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        {/* Branding */}
                        <div className="flex items-center gap-3">

                            {/* Logo */}
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center">
                                <img
                                    src="/SKLogo.png"
                                    alt="Sainik Canteen Logo"
                                    className="h-9 w-9 object-contain"
                                />
                            </div>

                            {/* Text */}
                            <div className="leading-tight">
                                <span className="block text-lg font-bold text-emerald-100 tracking-tight">
                                    Sainik Canteen
                                </span>
                                <span className="block text-[10px] font-medium text-emerald-400 uppercase tracking-widest">
                                    Admin Portal
                                </span>
                            </div>

                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Profile Section */}
                    </div>
                </header>


                {/* Page Content Wrapper */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar-content">
                    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 slide-in-from-bottom-4">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}