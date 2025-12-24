import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Package,
  Home,
  Store
} from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const { cart } = useCart() || { cart: [] };
  const cartItemCount =
    cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  const isActive = (path) =>
    location.pathname === path
      ? "bg-emerald-800 text-white shadow-inner"
      : "text-emerald-200 hover:bg-emerald-800/70 hover:text-white";

  return (
    <nav className="bg-emerald-900 text-emerald-100 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-3 font-bold text-xl tracking-wide hover:opacity-90 transition-opacity"
          >
            <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0">
              <img
                src="/SKLogo.png"
                alt="Sainik Canteen Logo"
                className="h-9 w-9 object-contain"
              />
            </div>
            <span className="leading-tight text-emerald-100">
              Sainik Canteen
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex space-x-2">
            <NavLink
              to="/"
              icon={<Home size={18} />}
              label="Home"
              activeClass={isActive("/")}
            />
            <NavLink
              to="/products"
              icon={<Store size={18} />}
              label="Products"
              activeClass={isActive("/products")}
            />
            <NavLink
              to="/orders"
              icon={<Package size={18} />}
              label="Orders"
              activeClass={isActive("/orders")}
            />

            {/* Cart */}
            <Link
              to="/cart"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative ${isActive(
                "/cart"
              )}`}
            >
              <div className="relative">
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-emerald-900">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>

            <NavLink
              to="/profile"
              icon={<User size={18} />}
              label="Profile"
              activeClass={isActive("/profile")}
            />
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-emerald-800 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-2 bg-emerald-900 border-t border-emerald-800 shadow-inner">
          <MobileNavLink to="/" label="Home" onClick={() => setIsOpen(false)} />
          <MobileNavLink
            to="/products"
            label="Products"
            onClick={() => setIsOpen(false)}
          />
          <MobileNavLink
            to="/orders"
            label="My Orders"
            onClick={() => setIsOpen(false)}
          />

          <Link
            to="/cart"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 rounded-lg text-base font-medium hover:bg-emerald-800 flex justify-between items-center"
          >
            <span className="flex items-center gap-3">
              <ShoppingCart size={20} /> Cart
            </span>
            {cartItemCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {cartItemCount} Items
              </span>
            )}
          </Link>

          <MobileNavLink
            to="/profile"
            label="Profile"
            onClick={() => setIsOpen(false)}
          />
        </div>
      </div>
    </nav>
  );
}

/* ---------- Sub-components ---------- */

const NavLink = ({ to, icon, label, activeClass }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${activeClass}`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const MobileNavLink = ({ to, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-3 rounded-lg text-base font-medium text-emerald-100 hover:bg-emerald-800 transition-colors"
  >
    {label}
  </Link>
);
