// src/pages/AdminDashboard.jsx
import React from 'react';
import { Routes, Route, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
// --- Icons ---
import {
    House, UserList, Buildings, SuitcaseSimple,
    ShoppingCartSimple, ChartBar, Bed, AirplaneTilt, CarSimple, PlusCircle, SignOut
} from '@phosphor-icons/react'; // Sử dụng icon mới từ Phosphor
import { useAuth } from '../context/AuthContext'; // Import useAuth

// --- Import các trang ---
import ManageCustomers from './ManageCustomers';
import ManageSuppliers from './ManageSuppliers';
import Reports from './Reports';
import DashboardHome from './DashboardHome';
import ManageProducts from './ManageProducts';
import ManageBookings from './ManageBookings';
import AddToursFromData from './AddToursFromData';
import AddHotelsFromData from './AddHotelsFromData'; // Import trang thêm KS

// --- Component Sidebar ---
const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Lấy user và hàm logout

    // Cấu trúc Nav mới với icon Phosphor
    const navItems = [
        { path: '/admin', label: 'Tổng quan', icon: House },
        { path: '/admin/customers', label: 'Khách hàng', icon: UserList },
        { path: '/admin/suppliers', label: 'Nhà cung cấp', icon: Buildings },
        { path: '/admin/bookings', label: 'Quản lý Đặt chỗ', icon: ShoppingCartSimple },
        { path: '/admin/reports', label: 'Báo cáo', icon: ChartBar },
        { type: 'divider', label: 'Sản phẩm' },
        { path: '/admin/tours', label: 'Quản lý Tours', icon: SuitcaseSimple },
        { path: '/admin/hotels', label: 'Quản lý Khách sạn', icon: Bed },
        { path: '/admin/flights', label: 'Quản lý Chuyến bay', icon: AirplaneTilt },
        { path: '/admin/cars', label: 'Quản lý Xe', icon: CarSimple },
        { type: 'divider', label: 'Thêm Nhanh' }, // Divider mới
        { path: '/admin/add-tours-from-data', label: 'Thêm nhanh Tour', icon: PlusCircle },
        { path: '/admin/add-hotels-from-data', label: 'Thêm nhanh Khách sạn', icon: PlusCircle }, // Link thêm KS
    ];

    const handleLogout = async () => {
        await logout();
        navigate("/"); // Về trang chủ sau khi logout
    };

    return (
        <div className="flex flex-col w-64 min-h-screen bg-slate-900 text-slate-300 shadow-lg">
            {/* Header Sidebar */}
            <div className="px-5 py-6 flex items-center gap-3 border-b border-slate-700">
                <img src="/logo-icon.png" alt="Logo" className="w-8 h-8"/>
                 <h2 className="text-xl font-bold text-sky-400">TourZen Admin</h2>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item, index) => {
                    if (item.type === 'divider') {
                        return (
                            <h3 key={index} className="px-3 pt-5 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {item.label}
                            </h3>
                        );
                    }
                    // Sử dụng NavLink để tự động active class
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'} // Chỉ active chính xác cho trang Tổng quan
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                                isActive
                                    ? 'bg-sky-700 text-white font-medium shadow-inner'
                                    : 'hover:bg-slate-700 hover:text-white'
                                }`
                            }
                        >
                            <item.icon size={20} weight="duotone" />
                            <span className="text-sm">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            {user && (
                <div className="px-3 py-4 border-t border-slate-700 mt-auto">
                     <p className="text-sm font-medium text-white truncate mb-2 px-2" title={user.email}>
                        Xin chào, {user.full_name}!
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

// --- Component Chính ---
export default function AdminDashboard() {
    return (
        <div className="flex min-h-screen"> {/* Thêm min-h-screen */}
            <AdminSidebar />
            {/* Khu vực nội dung chính */}
            <main className="flex-1 p-8 bg-slate-100 dark:bg-slate-950 overflow-y-auto"> {/* Thêm overflow */}
                <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="customers" element={<ManageCustomers />} />
                    <Route path="suppliers" element={<ManageSuppliers />} />
                    <Route path="bookings" element={<ManageBookings />} />
                    <Route path="reports" element={<Reports />} />

                    {/* Routes Sản phẩm */}
                    <Route path="tours" element={<ManageProducts productType="tour" />} />
                    <Route path="hotels" element={<ManageProducts productType="hotel" />} />
                    <Route path="flights" element={<ManageProducts productType="flight" />} />
                    <Route path="cars" element={<ManageProducts productType="car_rental" />} />

                    {/* Routes Thêm Nhanh */}
                    {/* 👇 Sửa path cho AddToursFromData 👇 */}
                    <Route path="add-tours-from-data" element={<AddToursFromData />} />
                     {/* 👇 Thêm Route cho AddHotelsFromData 👇 */}
                    <Route path="add-hotels-from-data" element={<AddHotelsFromData />} />

                </Routes>
            </main>
        </div>
    );
}