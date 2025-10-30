// src/pages/SupplierDashboard.jsx
// (SỬA: Sửa lại route "hotels" thành "tours" cho đúng logic)
// (NÂNG CẤP: Thêm Framer Motion cho animations, gradients, shadows, hiệu ứng hover tương tự AdminDashboard)

import React from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion'; // <-- IMPORT MOTION
import {
  Package, // <-- THÊM (Icon cho Tour)
  CarSimple,
  AirplaneTilt,
  SignOut,
  House,
  PlusCircle,
} from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";

// --- Import các trang dành riêng cho Supplier ---
import SupplierManageProducts from "./SupplierManageProducts";
import ManageTransport from "./ManageTransport";
import ManageFlights from "./ManageFlights";
import SupplierHome from "./SupplierHome"; 
import SupplierAddQuickTour from "./SupplierAddQuickTour"; 
import NotFound from "./NotFound"; // Giả sử có trang 404

// --- (NÂNG CẤP) Component Link của Sidebar ---
function SidebarLink({ to, icon, children, end = false }) {
    const baseClass = "flex items-center gap-3 py-3 px-6 rounded-xl transition-all duration-300 relative";
    const textClass = "text-base font-semibold";

    // (MỚI) Định nghĩa animation cho từng link
    const linkVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <motion.div 
            variants={linkVariants} 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
        >
            <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                    `${baseClass} w-full group ` + // Thêm w-full và group cho hover
                    (isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-blue-100 hover:bg-white/10 hover:shadow-md')
                }
            >
                <div className="flex-shrink-0 text-xl">{icon}</div>
                <span className={textClass}>
                    {children}
                </span>
                {/* (MỚI) Indicator cho active link */}
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-md scale-y-0 group-[.active]:scale-y-100 transition-transform duration-300"></span>
            </NavLink>
        </motion.div>
    );
}

const SupplierSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: "/supplier", label: "Tổng quan", icon: House, end: true },
    { type: "divider", label: "Dịch vụ cung cấp" },
    
    // === (SỬA) Đổi "hotels" thành "tours" ===
    { path: "/supplier/tours", label: "Quản lý Tour", icon: Package },
    // === KẾT THÚC SỬA ===
    
    { path: "/supplier/transport", label: "TourZenExpress (Xe)", icon: CarSimple },
    { path: "/supplier/flights", label: "Quản lý Chuyến bay", icon: AirplaneTilt },
    { type: "divider", label: "Tiện ích mở rộng" },
    { path: "/supplier/add-quick-tour", label: "Thêm Tour nhanh", icon: PlusCircle }, 
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // (MỚI) Định nghĩa animation cho container chứa các link
  const navContainerVariants = {
      hidden: { opacity: 0 },
      visible: {
          opacity: 1,
          transition: {
              staggerChildren: 0.1, // Mỗi link cách nhau 0.1s để mượt hơn
              delayChildren: 0.2,
          },
      },
  };

  return (
    <motion.div 
        className="flex flex-col w-72 h-screen bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-2xl"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Logo Area - Nâng cấp với gradient và shadow */}
      <motion.div 
          className="flex items-center justify-between h-20 px-6 border-b border-blue-600/30 bg-blue-800/50 backdrop-blur-md shadow-md"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
      >
          <span className="font-extrabold text-3xl text-white tracking-wide">
              TourZen
          </span>
          <img src="/logo-icon.png" alt="Logo" className="w-8 h-8" onError={(e) => {e.target.style.display='none'}} />
      </motion.div>

      {/* (NÂNG CẤP) Navigation - Thêm space-y-2 cho khoảng cách */}
      <motion.nav 
          className="flex-1 p-6 space-y-2 overflow-y-auto"
          variants={navContainerVariants}
          initial="hidden"
          animate="visible"
      >
        {navItems.map((item, index) => {
          if (item.type === "divider") {
            return (
              <motion.h3
                key={index}
                className="px-3 pt-5 pb-1 text-xs font-semibold text-blue-300 uppercase tracking-wider"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {item.label}
              </motion.h3>
            );
          }

          return (
            <SidebarLink key={item.path} to={item.path} icon={<item.icon size={24} />} end={item.end}>
              {item.label}
            </SidebarLink>
          );
        })}
      </motion.nav>

      {/* User Info & Logout */}
      {user && (
        <motion.div 
            className="p-6 border-t border-blue-600/30 bg-blue-800/50 backdrop-blur-md shadow-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }} // Delay để chờ link load xong
        >
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-300 group">
                <UserCircle size={48} weight="light" className="flex-shrink-0 text-blue-200 group-hover:text-white" />
                <div className="flex-1 min-w-0">
                    <p className="text-base font-bold truncate text-white">Xin chào, {user.full_name || user.email}!</p>
                    <p className="text-sm text-blue-200 truncate">Supplier</p>
                </div>
                <Gear size={24} className="text-blue-200 group-hover:rotate-90 transition-transform duration-300" />
            </div>
            {/* (MỚI) Thêm nút Logout */}
            <motion.button 
                className="flex items-center gap-3 py-3 px-6 w-full text-left text-blue-100 hover:bg-white/10 rounded-xl transition-colors duration-300 mt-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
            >
                <SignOut size={24} />
                <span className="text-base font-semibold">Đăng xuất</span>
            </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function SupplierDashboard() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <SupplierSidebar />
      <motion.main 
          className="flex-1 p-8 overflow-y-auto shadow-inner"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Routes>
          <Route path="/" element={<SupplierHome />} />

          {/* === (SỬA) Đổi path và prop === */}
          <Route path="tours" element={<SupplierManageProducts productType="tour" />} />
          {/* === KẾT THÚC SỬA === */}
          
          <Route path="transport" element={<ManageTransport />} />
          <Route path="flights" element={<ManageFlights />} />
          <Route path="add-quick-tour" element={<SupplierAddQuickTour />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.main>
    </div>
  );
}