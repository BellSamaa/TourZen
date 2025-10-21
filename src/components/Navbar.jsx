import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plane,
  Hotel,
  Percent,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
// import { useCart } from "../context/CartContext"; 

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

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};

const ProfileMenu = ({ user, isAdmin }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/"); 
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
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-sky-500 hover:text-white"
                >
                  <LayoutDashboard size={16} />
                  Trang Quản trị
                </Link>
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

export default function Navbar() {
  const { session, user, isAdmin, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const { cart } = useCart(); 
  
  const cartItemCount = 0; 

  const navLinks = [
    { name: "Du lịch", path: "/tours", icon: <Plane size={18} /> },
    { name: "Khách sạn", path: "/hotels", icon: <Hotel size={18} /> },
    { name: "Khuyến mãi", path: "/promotions", icon: <Percent size={18} /> },
  ];

  // 4. Hàm render phần Đăng nhập/Profile (ĐÃ SỬA LỖI)
  const renderAuthSection = () => {
    if (loading) {
      return (
        <div className="w-24 h-8 bg-gray-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>
      );
    }

    if (session && user) {
      return <ProfileMenu user={user} isAdmin={isAdmin} />;
    }

    return (
      <Link
        to="/login"
        className="hidden md:flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md transition-all"
      >
        <User size={16} />
        Đăng nhập
      </Link>
    );
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-neutral-800">
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
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
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

        {/* ===== Right Section: Icons & Auth ===== */}
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

          <div className="hidden md:block">
            {renderAuthSection()}
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      
      {/* ===== Mobile Menu Dropdown ===== */}
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
                  // Sửa lỗi cú pháp 'isActive'R'
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
              
              {/* Auth cho Mobile */}
              {loading ? (
                <div className="w-full h-10 bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse"></div>
              ) : session && user ? (
                <>
                  <p className="font-semibold dark:text-white px-1">Chào, {user.full_name}!</p>
                  {isAdmin && (
                     <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 font-medium text-sky-600 dark:text-sky-400 px-1"
                    >
                      <LayoutDashboard size={18} /> Trang Quản trị
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      // Gọi hàm logout từ context
                      const { logout } = useAuth(); 
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
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
    </header>
  );
}