// src/components/Navbar.jsx
/* *** (SỬA THEO YÊU CẦU v37.2) ***
  1. (CSS) SỬA LỖI: Bọc @keyframes trong :global() để animation hoạt động.
  2. (Giữ nguyên) Áp dụng .galaxy-text cho "TourZen" và "Đăng nhập".
  3. (Giữ nguyên) Tăng kích thước (text-3xl -> text-4xl) cho "TourZen".
  4. (Giữ nguyên) Tăng kích thước (w-7 h-7 -> w-9 h-9) cho logo.
  5. (Giữ nguyên) Tăng kích thước (text-sm -> text-base, padding) cho nút "Đăng nhập".
*/

import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plane,
  Users, // Đã thay đổi từ Hotel
  Percent,
  User,
  LogOut,
  LayoutDashboard,
  Truck,
  Menu,
  X,
  Sun,
  Moon,
  ShoppingBag, // Thêm icon cho đơn hàng
  IdCard // <<< SỬA LỖI v19.1: Đổi tên icon từ IdentificationCard -> IdCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
// import { useCart } from "../context/CartContext";

// 🌙 Theme Toggle
const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};

// 👤 Profile Dropdown Menu
const ProfileMenu = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    // Phải xóa cả 'user' trong localStorage của hệ thống "ảo"
    // và tải lại trang.
    await logout(); // Chạy hàm logout gốc (xóa session nếu có)
    localStorage.removeItem("user"); // Xóa user "ảo"
    window.location.href = "/"; // Tải lại trang để navbar cập nhật
  };

  const goToDashboard = () => {
    if (user.role === "admin") navigate("/admin");
    else if (user.role === "supplier") navigate("/supplier");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-white hover:text-sky-600 dark:hover:text-sky-400"
      >
        <User size={18} />
        <span className="hidden md:inline">Chào, {user.full_name}!</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-3 w-56 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border dark:border-neutral-700 overflow-hidden z-50"
          >
            <div className="p-3 border-b dark:border-neutral-700">
              <p className="font-semibold text-gray-800 dark:text-white truncate">{user.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
            <nav className="p-2">
              {user.role === "admin" && (
                <button
                  onClick={() => {
                    goToDashboard();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-sky-500 hover:text-white"
                >
                  <LayoutDashboard size={16} />
                  Trang Quản trị
                </button>
              )}

              {user.role === "supplier" && (
                <button
                  onClick={() => {
                    goToDashboard();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-sky-500 hover:text-white"
                >
                  <Truck size={16} />
                  Suppliers Dashboard
                </button>
              )}

              {user.role !== "admin" && user.role !== "supplier" && (
                <>
                  <button
                    onClick={() => {
                      navigate("/my-bookings");
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-sky-500 hover:text-white"
                  >
                    <ShoppingBag size={16} />
                    Đơn hàng của tôi
                  </button>
                  
                  {/* <<< THÊM v19: Link Thông tin cá nhân >>> */}
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-sky-500 hover:text-white"
                  >
                    {/* <<< SỬA LỖI v19.1: Đổi tên icon >>> */}
                    <IdCard size={16} /> 
                    Thông tin cá nhân
                  </button>
                </>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 🌍 Navbar Chính
export default function Navbar() {
  const { session, user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const { cart } = useCart();
  const cartItemCount = 0;

  const navLinks = [
    { name: "Du lịch", path: "/tours", icon: <Plane size={18} /> },
    { name: "Về Chúng Tôi", path: "/about", icon: <Users size={18} /> }, // Đã thay đổi
    { name: "Khuyến mãi", path: "/promotions", icon: <Percent size={18} /> },
  ];

  const renderAuthSection = () => {
    if (loading)
      return <div className="w-24 h-8 bg-gray-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>;
    
    // <<< SỬA LỖI QUAN TRỌNG >>>
    // Thay vì `if (session && user)`, chỉ cần kiểm tra `if (user)`
    // vì hệ thống "ảo" của bạn chỉ cung cấp 'user' (từ localStorage)
    // mà không cung cấp 'session'.
    if (user) return <ProfileMenu user={user} />;
    // <<< KẾT THÚC SỬA LỖI >>>

    {/* === (SỬA v37.1) Sửa nút Đăng nhập === */}
    return (
      <Link
        to="/login"
        className="hidden md:flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-base font-semibold px-6 py-2.5 rounded-full shadow-md transition-all"
      >
        <User size={16} className="galaxy-text" />
        <span className="galaxy-text">Đăng nhập</span>
      </Link>
    );
    {/* === (KẾT THÚC SỬA v37.1) === */}
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-start leading-none group">
          <div className="flex items-center gap-2">
            
            {/* === (SỬA v37.1) Sửa "TourZen" === */}
            <span className="text-4xl font-extrabold galaxy-text tracking-tight group-hover:scale-105 transition-transform duration-300">
              TourZen
            </span>
            
            {/* === (SỬA v37.1) Sửa Logo === */}
            <img
              src="/logo-icon.png"
              alt="TourZen Logo"
              className="w-9 h-9 opacity-90 group-hover:opacity-100 transition"
              onError={(e) => (e.target.style.display = "none")}
            />
            
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
            Managed by Nhóm 4
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-sky-600 dark:text-sky-400 font-semibold border-b-2 border-sky-600 pb-1"
                    : "text-gray-700 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400"
                }`
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/cart"
            className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            <ShoppingCart size={18} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold text-center leading-4">
                {cartItemCount}
              </span>
            )}
          </Link>

          <div className="hidden md:block">{renderAuthSection()}</div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800"
          >
            <nav className="flex flex-col px-6 py-5 gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 text-base font-medium ${
                      isActive ? "text-sky-600" : "text-gray-700 dark:text-gray-200"
                    }`
                  }
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}

              <hr className="dark:border-neutral-700" />

              {loading ? (
                <div className="w-full h-10 bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse"></div>
              ) : 
              
              // <<< SỬA LỖI QUAN TRỌNG (Giống như trên) >>>
              // Thay `session && user` thành `user`
              user ? (
              // <<< KẾT THÚC SỬA LỖI >>>
                <>
                  <p className="font-semibold dark:text-white px-1">Chào, {user.full_name}!</p>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 font-medium text-sky-600 dark:text-sky-400 px-1"
                    >
                      <LayoutDashboard size={18} /> Trang Quản trị
                    </Link>
                  )}
                  {user.role === "supplier" && (
                    <Link
                      to="/supplier"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 font-medium text-sky-600 dark:text-sky-400 px-1"
                    >
                      <Truck size={18} /> Bảng điều khiển Nhà cung cấp
                    </Link>
                  )}
                  {user.role !== "admin" && user.role !== "supplier" && (
                    <>
                      <Link
                        to="/my-bookings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 font-medium text-sky-600 dark:text-sky-400 px-1"
                      >
                        <ShoppingBag size={18} /> Đơn hàng của tôi
                      </Link>
                      
                      {/* <<< THÊM v19: Link Thông tin cá nhân >>> */}
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 font-medium text-sky-600 dark:text-sky-400 px-1"
                      >
                         {/* <<< SỬA LỖI v19.1: Đổi tên icon >>> */}
                        <IdCard size={18} /> 
                        Thông tin cá nhân
                      </Link>
                    </>
                  )}
                  <button
                    // <<< SỬA LỖI QUAN TRỌNG >>>
                    // Thêm localStorage.removeItem và tải lại trang
                    onClick={() => {
                      const { logout } = useAuth();
                      logout();
                      localStorage.removeItem("user"); // Xóa user "ảo"
                      window.location.href = "/"; // Tải lại trang
                      setIsMobileMenuOpen(false);
                    }}
                    // <<< KẾT THÚC SỬA LỖI >>>
                    className="flex items-center gap-3 font-medium text-red-600 dark:text-red-400 px-1"
                  >
                    <LogOut size={18} /> Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md"
                >
                  <User size={16} />
                  Đăng nhập
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* === (SỬA LỖI v37.2) Bọc @keyframes trong :global() === */}
      <style jsx>{`
        :global(.galaxy-text) {
          background: linear-gradient(90deg, #007cf0, #00dfd8, #ff00c3, #007cf0);
          background-size: 400% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: galaxy-animation 5s linear infinite;
          -webkit-text-fill-color: transparent; /* Đảm bảo hoạt động trên Safari */
        }
        
        /* Bọc keyframes trong :global() để styled-jsx nhận diện */
        :global(@keyframes galaxy-animation) {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
    </header>
  );
}