import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ShoppingCart,
  Plane,
  Hotel,
  Percent,
  User,
} from "lucide-react";

export default function Navbar() {
  const navLinks = [
    { name: "Du lịch", path: "/tours", icon: <Plane size={18} /> },
    { name: "Khách sạn", path: "/hotels", icon: <Hotel size={18} /> },
    { name: "Khuyến mãi", path: "/promotions", icon: <Percent size={18} /> },
    { name: "Giỏ hàng", path: "/cart", icon: <ShoppingCart size={18} /> },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* ===== Logo Section ===== */}
        <Link to="/" className="flex flex-col items-start leading-none group">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent tracking-tight group-hover:scale-105 transition-transform duration-300">
              TourZen
            </span>
            <img
              src="/logo-icon.png"
              alt="TourZen Logo"
              className="w-7 h-7 opacity-90 group-hover:opacity-100 transition"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
          <span className="text-[11px] text-gray-500 font-medium mt-0.5">
            Managed by Nhóm 4
          </span>
        </Link>

        {/* ===== Navigation Links ===== */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-sky-600 font-semibold border-b-2 border-sky-600 pb-1"
                    : "text-gray-700 hover:text-sky-500"
                }`
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* ===== Login Button ===== */}
        <Link
          to="/login"
          className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md transition-all"
        >
          <User size={16} />
          Đăng nhập
        </Link>
      </div>
    </header>
  );
}
