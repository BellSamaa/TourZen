// src/pages/AdminDashboard.jsx
// (NÂNG CẤP HIỆU ỨNG: Thêm Framer Motion vào Sidebar)

import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
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
    UserCircle
} from '@phosphor-icons/react';

// --- (NÂNG CẤP) Component Link của Sidebar ---
function SidebarLink({ to, icon, children }) {
    const baseClass = "flex items-center gap-3 py-3 px-6 rounded-lg transition-colors duration-200";
    const textClass = "text-sm font-medium";

    // (MỚI) Định nghĩa animation cho từng link
    const linkVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <motion.div variants={linkVariants} whileHover={{ x: 3 }}>
            <NavLink
                to={to}
                end
                className={({ isActive }) =>
                    `${baseClass} w-full ` + // Thêm w-full
                    (isActive
                        ? 'bg-white/10 text-white'
                        : 'text-blue-100 hover:bg-white/5')
                }
            >
                <div className="flex-shrink-0">{icon}</div>
                <span className={textClass}>
                    {children}
                </span>
            </NavLink>
        </motion.div>
    );
}

// --- (NÂNG CẤP) Component Sidebar ---
function Sidebar() {
    // (MỚI) Định nghĩa animation cho container chứa các link
    const navContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08, // Mỗi link cách nhau 0.08s
            },
        },
    };

    return (
        <div className="flex flex-col w-64 h-screen bg-blue-600 text-white">
            
            {/* Logo Area */}
            <motion.div 
                className="flex items-center justify-between h-16 px-6 border-b border-blue-500/50"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <span className="font-bold text-2xl text-white">
                    TourZen
                </span>
                <button className="text-blue-200 hover:text-white">
                    <List size={24} />
                </button>
            </motion.div>

            {/* (NÂNG CẤP) Navigation */}
            <motion.nav 
                className="flex-1 p-4 space-y-1 overflow-y-auto"
                variants={navContainerVariants}
                initial="hidden"
                animate="visible"
            >
                <SidebarLink to="/admin/dashboard" icon={<Layout size={20} />}>
                    Tổng Quan
                </SidebarLink>
                <SidebarLink to="/admin/tours" icon={<AirplaneTilt size={20} />}>
                    Quản lý Tour
                </SidebarLink>
                <SidebarLink to="/admin/bookings" icon={<Package size={20} />}>
                    Quản lý Đơn Đặt
                </SidebarLink>
                <SidebarLink to="/admin/customers" icon={<Users size={20} />}>
                    Quản lý Khách Hàng
                </SidebarLink>
                <SidebarLink to="/admin/suppliers" icon={<Buildings size={20} />}>
                    Quản lý Nhà Cung Cấp
                </SidebarLink>
                <SidebarLink to="/admin/accounts" icon={<UserCircleGear size={20} />}>
                    Quản lý Tài Khoản
                </SidebarLink>
            </motion.nav>

            {/* (NÂNG CẤP) User Profile */}
            <motion.div 
                className="p-4 border-t border-blue-500/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }} // Delay để chờ link load xong
            >
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                    <UserCircle size={36} weight="light" className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">Nguyễn Văn An</p>
                        <p className="text-xs text-blue-200 truncate">Admin</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}


// --- Component Layout chính (Giữ nguyên) ---
export default function AdminDashboard() {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-slate-900 p-6">
                    <Outlet />
                </main>
            </div>
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    className: 'dark:bg-slate-700 dark:text-white',
                }}
            />
        </div>
    );
}