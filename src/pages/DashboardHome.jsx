// src/pages/AdminDashboard.jsx
// (Làm lại hoàn toàn để làm layout và router)

import React from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
    House,         // Tổng quan
    UserList,      // Quản lý Tài khoản
    UsersThree,    // Quản lý Khách hàng
    Buildings,     // Quản lý Nhà cung cấp
    Package,       // Quản lý Đặt Tour
    CheckSquare,   // Quản lý Sản phẩm Tour
    ChartBar,      // Báo cáo
    SignOut 
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

// --- Import 7 component con ---
import DashboardHome from './DashboardHome';
import ManageAccounts from './ManageAccounts';         // 1. Quản lý Tài khoản
import ManageCustomers from './ManageCustomers';       // 2. Quản lý Khách hàng (CRM)
import ManageTour from './ManageTour';               // 3. Quản lý Đặt Tour
import AdminManageProducts from './AdminManageProducts'; // 4. Quản lý Sản phẩm Tour
import ManageSuppliers from './ManageSuppliers';       // 5. Quản lý Nhà cung cấp
import Reports from './Reports'; // (File báo cáo)

// --- Component Sidebar (Đã cập nhật) ---
const AdminSidebar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Giả định bạn có useAuth

    // <<< DANH SÁCH 5 CHỨC NĂNG CHÍNH + 2
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
        // Giả sử hàm logout của bạn xử lý việc signout khỏi supabase
        // await supabase.auth.signOut(); 
        if(logout) {
            await logout();
        }
        navigate("/");
   };

    return (
        <div className="flex flex-col w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300 shadow-lg">
            {/* Header Sidebar */}
            <div className="px-5 py-6 flex items-center gap-3 border-b border-slate-700">
                 {/* <img src="/logo-icon.png" alt="Logo" className="w-8 h-8" /> */}
                 <h2 className="text-xl font-bold text-sky-400">TourZen Admin</h2>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        // 'end' chỉ áp dụng cho trang Tổng quan
                        end={item.path === '/admin'} 
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                            isActive
                                ? 'bg-sky-700 text-white font-semibold shadow-inner'
                                : 'hover:bg-slate-700 hover:text-white'
                            }`
                        }
                    >
                          {item.icon && <item.icon size={22} weight="duotone" />}
                          <span className="text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Info & Logout */}
            {user && (
                  <div className="px-3 py-4 border-t border-slate-700 mt-auto">
                        <p className="text-sm font-medium text-white truncate mb-2 px-2" title={user.email}>
                            {/* Giả sử user object có full_name, nếu không, dùng email */}
                            Xin chào, {user.full_name || user.email}!
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
    return (
        <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
            <AdminSidebar />
            
            {/* Vùng nội dung chính */}
            <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
                {/* Thiết lập các Routes */}
                <Routes>
                    {/* Trang chủ Admin */}
                    <Route path="/" element={<DashboardHome />} /> 
                    
                    {/* 5 Chức năng chính */}
                    <Route path="accounts" element={<ManageAccounts />} /> 
                    <Route path="customers" element={<ManageCustomers />} /> 
                    <Route path="suppliers" element={<ManageSuppliers />} />
                    <Route path="tours" element={<ManageTour />} /> 
                    <Route path="products" element={<AdminManageProducts />} />
                    
                    {/* Trang báo cáo */}
                    <Route path="reports" element={<Reports />} />
                </Routes>
            </main>
        </div>
    );
}