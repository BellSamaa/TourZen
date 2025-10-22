// src/pages/AdminDashboard.jsx
import React from 'react';
import { Routes, Route, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
// --- Icons ---
import {
    House, UserList, Buildings, SuitcaseSimple,
    ShoppingCartSimple, ChartBar, PlusCircle, SignOut
} from '@phosphor-icons/react'; // Chỉ dùng các icon cần thiết
import { useAuth } from '../context/AuthContext'; // Import useAuth

// --- Import các trang ---
import ManageCustomers from './ManageCustomers';
import ManageSuppliers from './ManageSuppliers';
import Reports from './Reports';
import DashboardHome from './DashboardHome';
import ManageProducts from './ManageProducts'; // Component quản lý chung
import ManageBookings from './ManageBookings';
import AddToursFromData from './AddToursFromData';
// KHÔNG import AddHotelsFromData ở đây nữa

// --- Component Sidebar ---
const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Lấy user và hàm logout

    // Cấu trúc Nav mới theo 5 chức năng chính + Tổng quan & Báo cáo
    const navItems = [
        { path: '/admin', label: 'Tổng quan', icon: House },
        // 1. Quản lý Tài khoản & Khách hàng (Gộp chung)
        { path: '/admin/customers', label: 'Tài khoản & Khách hàng', icon: UserList },
        // 2. Quản lý Nhà cung cấp (Admin xem/duyệt)
        { path: '/admin/suppliers', label: 'Đối tác (Nhà Cung Cấp)', icon: Buildings },
        // 3. Quản lý Đặt Tour/Dịch vụ
        { path: '/admin/bookings', label: 'Quản lý Đặt chỗ', icon: ShoppingCartSimple },
        // 4. Quản lý Sản phẩm (Gộp Tour, Hotel, Flight, Car)
        { path: '/admin/products', label: 'Quản lý Sản phẩm', icon: SuitcaseSimple },
        // Mục Thêm nhanh Tour (Nằm gần Sản phẩm)
        { path: '/admin/add-tours-from-data', label: 'Thêm nhanh Tour', icon: PlusCircle },
        // 5. Báo cáo & Thống kê
        { path: '/admin/reports', label: 'Báo cáo & Thống kê', icon: ChartBar },
        // --- ĐÃ LOẠI BỎ CÁC LINK RIÊNG LẺ VÀ THÊM NHANH KS ---
    ];

    const handleLogout = async () => {
        await logout();
        navigate("/"); // Về trang chủ sau khi logout
    };

    return (
        <div className="flex flex-col w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300 shadow-lg">
            {/* Header Sidebar */}
            <div className="px-5 py-6 flex items-center gap-3 border-b border-slate-700">
                <img src="/logo-icon.png" alt="Logo" className="w-8 h-8"/>
                 <h2 className="text-xl font-bold text-sky-400">TourZen Admin</h2>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto"> {/* Tăng space */}
                {navItems.map((item) => (
                    <NavLink
                        key={item.path} // Chỉ map các item có path
                        to={item.path}
                        end={item.path === '/admin'} // Active chính xác cho Tổng quan
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${ // Thêm group
                            isActive
                                ? 'bg-sky-700 text-white font-semibold shadow-inner' // Nổi bật hơn
                                : 'hover:bg-slate-700 hover:text-white transform hover:translate-x-1' // Hiệu ứng hover
                            }`
                        }
                    >
                        {/* Hiệu ứng nhẹ cho icon */}
                        <item.icon size={22} weight="duotone" className={`transition-transform duration-200 ${location.pathname.startsWith(item.path) && item.path !== '/admin' || location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="text-sm">{item.label}</span>
                    </NavLink>
                ))}
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
        <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
            <AdminSidebar />
            <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto"> {/* Tăng padding */}
                <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="customers" element={<ManageCustomers />} />
                    <Route path="suppliers" element={<ManageSuppliers />} />
                    <Route path="bookings" element={<ManageBookings />} />
                    <Route path="reports" element={<Reports />} />

                    {/* --- Route chung cho Quản lý Sản phẩm --- */}
                    <Route path="products" element={<ManageProducts />} />
                    {/* ⚠️ Cần cập nhật ManageProducts để có bộ lọc/tab chọn productType */}

                    {/* Route Thêm Nhanh Tour */}
                    <Route path="add-tours-from-data" element={<AddToursFromData />} />

                    {/* --- ĐÃ XÓA CÁC ROUTE SẢN PHẨM RIÊNG LẺ VÀ ROUTE THÊM KS --- */}

                </Routes>
            </main>
        </div>
    );
}