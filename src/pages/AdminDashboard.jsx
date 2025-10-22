// src/pages/AdminDashboard.jsx
import React from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  House, UserList, Buildings, SuitcaseSimple,
  ShoppingCartSimple, ChartBar, PlusCircle, SignOut
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

// --- Import các trang ---
import ManageCustomers from './ManageCustomers';
import ManageSuppliers from './ManageSuppliers';
import Reports from './Reports';
import DashboardHome from './DashboardHome';
import AdminManageProducts from './AdminManageProducts'; // ✅ ĐÃ ĐỔI TÊN FILE
import ManageBookings from './ManageBookings';
import AddToursFromData from './AddToursFromData';

// --- Component Sidebar ---
const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/admin', label: 'Tổng quan', icon: House },
    { path: '/admin/customers', label: 'Tài khoản & Khách hàng', icon: UserList },
    { path: '/admin/suppliers', label: 'Đối tác (Nhà Cung Cấp)', icon: Buildings },
    { path: '/admin/bookings', label: 'Quản lý Đặt chỗ', icon: ShoppingCartSimple },
    { path: '/admin/products', label: 'Quản lý Sản phẩm', icon: SuitcaseSimple },
    { path: '/admin/add-tours-from-data', label: 'Thêm nhanh Tour', icon: PlusCircle },
    { path: '/admin/reports', label: 'Báo cáo & Thống kê', icon: ChartBar },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300 shadow-lg">
      {/* Header Sidebar */}
      <div className="px-5 py-6 flex items-center gap-3 border-b border-slate-700">
        <img src="/logo-icon.png" alt="Logo" className="w-8 h-8" />
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
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-sky-700 text-white font-semibold shadow-inner'
                  : 'hover:bg-slate-700 hover:text-white transform hover:translate-x-1'
              }`
            }
          >
            <item.icon
              size={22}
              weight="duotone"
              className={`transition-transform duration-200 ${
                location.pathname.startsWith(item.path) && item.path !== '/admin' ||
                location.pathname === item.path
                  ? 'scale-110'
                  : 'group-hover:scale-110'
              }`}
            />
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
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="customers" element={<ManageCustomers />} />
          <Route path="suppliers" element={<ManageSuppliers />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="reports" element={<Reports />} />

          {/* ✅ Route chung cho Quản lý Sản phẩm */}
          <Route path="products" element={<AdminManageProducts />} />

          {/* ✅ Route Thêm nhanh Tour */}
          <Route path="add-tours-from-data" element={<AddToursFromData />} />
        </Routes>
      </main>
    </div>
  );
}
