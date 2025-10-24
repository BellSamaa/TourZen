// src/pages/AdminDashboard.jsx
// (Đã tích hợp Lazy Loading, Suspense, Hiệu ứng chuyển trang)

import React, { Suspense } from 'react'; // <<< Thêm Suspense
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // <<< Thêm motion
import {
    House,         // Tổng quan
    UserList,      // Quản lý Tài khoản
    UsersThree,    // Quản lý Khách hàng (CRM)
    Buildings,     // Quản lý Nhà cung cấp
    Package,       // Quản lý Đặt Tour
    CheckSquare,   // Quản lý Sản phẩm Tour
    ChartBar,      // Báo cáo
    SignOut,
    CircleNotch    // <<< Thêm CircleNotch cho loading
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

// --- (LAZY LOAD) Import các trang ---
const DashboardHome = React.lazy(() => import('./DashboardHome'));
const ManageAccounts = React.lazy(() => import('./ManageAccounts'));
const ManageCustomers = React.lazy(() => import('./ManageCustomers'));
const ManageTour = React.lazy(() => import('./ManageTour'));
const AdminManageProducts = React.lazy(() => import('./AdminManageProducts'));
const ManageSuppliers = React.lazy(() => import('./ManageSuppliers'));
const Reports = React.lazy(() => import('./Reports'));

// --- Component Sidebar ---
const AdminSidebar = () => {
    const location = useLocation(); // <<< Thêm useLocation ở đây
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/admin', label: 'Tổng quan', icon: House },
        { path: '/admin/accounts', label: 'Quản lý Tài khoản', icon: UserList },
        { path: '/admin/customers', label: 'Quản lý Khách hàng', icon: UsersThree },
        { path: '/admin/suppliers', label: 'Quản lý Nhà cung cấp', icon: Buildings },
        { path: '/admin/tours', label: 'Quản lý Đặt Tour', icon: Package },
        { path: '/admin/products', label: 'Quản lý Sản phẩm Tour', icon: CheckSquare },
        { path: '/admin/reports', label: 'Báo cáo & Thống kê', icon: ChartBar },
    ];

    const handleLogout = async () => {
        if (logout) { await logout(); }
        navigate("/");
    };

    return (
        <div className="flex flex-col w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300 shadow-lg flex-shrink-0"> {/* <<< Thêm flex-shrink-0 */}
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
                        {/* Cập nhật weight icon */}
                        {item.icon && <item.icon size={22} weight={isActive ? "fill" : "light"} />} {/* <<< Dùng fill khi active */}
                        <span className="text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            {/* User Info & Logout */}
            {user && (
                <div className="px-3 py-4 border-t border-slate-700 mt-auto">
                    <p className="text-sm font-medium text-white truncate mb-2 px-2" title={user.email}>
                        {/* Sửa cách lấy full_name */}
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

// --- (MỚI) Component Fallback Loading ---
const LoadingFallback = () => (
    <div className="flex justify-center items-center h-[calc(100vh-100px)]"> {/* Giảm chiều cao chút */}
        <CircleNotch size={48} className="animate-spin text-sky-500" />
    </div>
);

// --- Hiệu ứng chuyển trang ---
const pageVariants = {
    initial: { opacity: 0, x: -20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 20 }
};
const pageTransition = { type: "tween", ease: "anticipate", duration: 0.4 };


// --- Component Chính AdminDashboard ---
export default function AdminDashboard() {
    const location = useLocation(); // <<< Thêm useLocation ở đây

    return (
        <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
            <AdminSidebar />
            <main className="flex-1 overflow-x-hidden relative"> {/* <<< Thêm relative và overflow-x-hidden */}
                {/* <<< Bọc Routes bằng Suspense và AnimatePresence >>> */}
                <Suspense fallback={<LoadingFallback />}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname} // Key cho animation
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                            className="p-6 md:p-8 lg:p-10" // Padding ở đây
                        >
                            {/* Thiết lập các Routes */}
                            <Routes location={location}> {/* <<< Cung cấp location */}
                                <Route path="/" element={<DashboardHome />} />
                                <Route path="accounts" element={<ManageAccounts />} />
                                <Route path="customers" element={<ManageCustomers />} />
                                <Route path="suppliers" element={<ManageSuppliers />} />
                                <Route path="tours" element={<ManageTour />} />
                                <Route path="products" element={<AdminManageProducts />} />
                                <Route path="reports" element={<Reports />} />
                                {/* Route fallback "*" nếu cần */}
                                {/* <Route path="*" element={<NotFoundAdmin />} /> */}
                            </Routes>
                        </motion.div>
                    </AnimatePresence>
                </Suspense> {/* <<< Đóng Suspense >>> */}
            </main>
        </div>
    );
}