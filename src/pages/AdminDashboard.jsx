// src/pages/AdminDashboard.jsx
// (Hoàn chỉnh + Hiệu ứng chuyển trang)

import React from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // <<< Thêm import
import {
    House, UserList, UsersThree, Buildings, Package,
    CheckSquare, ChartBar, SignOut
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

// --- Import các trang ---
import DashboardHome from './DashboardHome';
import ManageAccounts from './ManageAccounts';
import ManageCustomers from './ManageCustomers';
import ManageTour from './ManageTour';
import AdminManageProducts from './AdminManageProducts';
import ManageSuppliers from './ManageSuppliers';
import Reports from './Reports';

// --- Component Sidebar ---
const AdminSidebar = () => {
    const location = useLocation(); // <<< Thêm useLocation ở đây
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/admin', label: 'Tổng quan', icon: House },
        { path: '/admin/accounts', label: 'Quản lý Tài khoản', icon: UserList },
        { path: '/admin/customers', label: 'Quản lý Khách hàng', icon: UsersThree },
        { path: '/admin/tours', label: 'Quản lý Đặt Tour', icon: Package },
        { path: '/admin/products', label: 'Quản lý Sản phẩm Tour', icon: CheckSquare },
        { path: '/admin/suppliers', label: 'Quản lý Nhà cung cấp', icon: Buildings },
        { path: '/admin/reports', label: 'Báo cáo & Thống kê', icon: ChartBar },
    ];

    const handleLogout = async () => {
        if (logout) { await logout(); }
        navigate("/");
    };

    return (
        <div className="flex flex-col w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300 shadow-lg">
            {/* Header */}
            <div className="px-5 py-6 flex items-center gap-3 border-b border-slate-700">
                <h2 className="text-xl font-bold text-sky-400">TourZen Admin</h2>
            </div>
            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin'}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 group ${ // <<< Sửa lại transition
                            isActive
                                ? 'bg-sky-700 text-white font-semibold shadow-inner'
                                : 'hover:bg-slate-700 hover:text-white'
                            }`
                        }
                    >
                        {item.icon && <item.icon size={22} weight={location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path)) ? "duotone" : "light"} />} {/* <<< Cập nhật weight icon */}
                        <span className="text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            {/* User Info & Logout */}
            {user && (
                <div className="px-3 py-4 border-t border-slate-700 mt-auto">
                    <p className="text-sm font-medium text-white truncate mb-2 px-2" title={user.email}>
                        Xin chào, {user.user_metadata?.full_name || user.email}!
                    </p>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors"
                    >
                        <SignOut size={20} weight="duotone" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Component Chính AdminDashboard ---
export default function AdminDashboard() {
    const location = useLocation(); // <<< Thêm useLocation ở đây

    // <<< Định nghĩa hiệu ứng chuyển trang >>>
    const pageVariants = {
        initial: { opacity: 0, x: -20 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: 20 }
    };

    const pageTransition = {
        type: "tween", // Hoặc "spring"
        ease: "anticipate", // Hiệu ứng ease-in-out mượt mà
        duration: 0.4 // Thời gian chuyển
    };

    return (
        <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
            <AdminSidebar />
            <main className="flex-1 overflow-x-hidden relative"> {/* <<< Thêm relative và overflow-x-hidden */}
                 {/* <<< Bọc Routes bằng AnimatePresence để có hiệu ứng exit >>> */}
                <AnimatePresence mode="wait"> {/* mode="wait" đảm bảo trang cũ exit xong mới đến trang mới */}
                    <motion.div
                        key={location.pathname} // <<< Key thay đổi theo path để trigger animation
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="p-6 md:p-8 lg:p-10" // <<< Di chuyển padding vào đây
                    >
                        <Routes location={location}> {/* <<< Cung cấp location cho Routes */}
                            <Route path="/" element={<DashboardHome />} />
                            <Route path="accounts" element={<ManageAccounts />} />
                            <Route path="customers" element={<ManageCustomers />} />
                            <Route path="tours" element={<ManageTour />} />
                            <Route path="products" element={<AdminManageProducts />} />
                            <Route path="suppliers" element={<ManageSuppliers />} />
                            <Route path="reports" element={<Reports />} />
                        </Routes>
                    </motion.div>
                </AnimatePresence>
            </main>
            {/* Xóa các dòng render Modal lỗi ở đây */}
        </div>
    );
}