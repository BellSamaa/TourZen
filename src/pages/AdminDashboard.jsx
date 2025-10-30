// src/pages/AdminDashboard.jsx
// (NÂNG CẤP HIỆU ỨNG: Thêm Framer Motion vào Sidebar, Cải thiện bố cục với gradient, shadow, và hiệu ứng chuyên nghiệp hơn)

import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion'; // <-- IMPORT MOTION
import {
    Layout,
    AirplaneTilt,
    Package,
    Users,
    Buildings,
    UserCircleGear,
    List,
    UserCircle,
    SignOut,
    Gear
} from '@phosphor-icons/react';
import { useAuth } from "../context/AuthContext"; // Thêm import useAuth để xử lý logout

// --- (NÂNG CẤP) Component Link của Sidebar ---
function SidebarLink({ to, icon, children }) {
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
                end
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

// --- (NÂNG CẤP) Component Sidebar ---
function Sidebar() {
    const { user, logout } = useAuth(); // Thêm useAuth để lấy user và logout
    const navigate = useNavigate();

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

    const handleLogout = async () => {
        await logout();
        navigate("/");
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
                <button className="text-blue-200 hover:text-white transition-colors">
                    <List size={28} />
                </button>
            </motion.div>

            {/* (NÂNG CẤP) Navigation - Thêm space-y-2 cho khoảng cách */}
            <motion.nav 
                className="flex-1 p-6 space-y-2 overflow-y-auto"
                variants={navContainerVariants}
                initial="hidden"
                animate="visible"
            >
                <SidebarLink to="/admin/dashboard" icon={<Layout size={24} />}>
                    Tổng Quan
                </SidebarLink>
                <SidebarLink to="/admin/tours" icon={<AirplaneTilt size={24} />}>
                    Quản lý Sản phẩm Tour
                </SidebarLink>
                <SidebarLink to="/admin/bookings" icon={<Package size={24} />}>
                    Quản lý Đặt Tour
                </SidebarLink>
                <SidebarLink to="/admin/customers" icon={<Users size={24} />}>
                    Quản lý Khách Hàng
                </SidebarLink>
                <SidebarLink to="/admin/suppliers" icon={<Buildings size={24} />}>
                    Quản lý Nhà Cung Cấp
                </SidebarLink>
                <SidebarLink to="/admin/accounts" icon={<UserCircleGear size={24} />}>
                    Quản lý Tài Khoản
                </SidebarLink>
            </motion.nav>

            {/* (NÂNG CẤP) User Profile - Thêm hover effect và options */}
            <motion.div 
                className="p-6 border-t border-blue-600/30 bg-blue-800/50 backdrop-blur-md shadow-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }} // Delay để chờ link load xong
            >
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-300 group">
                    <UserCircle size={48} weight="light" className="flex-shrink-0 text-blue-200 group-hover:text-white" />
                    <div className="flex-1 min-w-0">
                        <p className="text-base font-bold truncate text-white">Admin</p>
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
        </motion.div>
    );
}


// --- Component Layout chính (Nâng cấp với animation cho main content) ---
export default function AdminDashboard() {
    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <motion.main 
                    className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 p-8 shadow-inner"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <Outlet />
                </motion.main>
            </div>
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    className: 'dark:bg-slate-800 dark:text-white shadow-lg rounded-xl',
                }}
            />
        </div>
    );
}