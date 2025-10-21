// src/pages/AdminDashboard.jsx
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUserFriends, 
  FaTruckLoading, 
  FaUmbrellaBeach, 
  FaShoppingCart, 
  FaChartBar 
} from 'react-icons/fa';

// Import các trang con (3 file bạn đã có)
import ManageCustomers from './ManageCustomers';
import ManageSuppliers from './ManageSuppliers';
import Reports from './Reports';

// Import các trang con mới (chúng ta sẽ tạo ở Bước 2)
import DashboardHome from './DashboardHome';
import ManageTours from './ManageTours';
import ManageBookings from './ManageBookings';

// --- Component Sidebar nội bộ ---
const AdminSidebar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/admin', label: 'Tổng quan', icon: <FaHome /> },
    { path: '/admin/customers', label: 'Khách hàng (Tài khoản)', icon: <FaUserFriends /> },
    { path: '/admin/suppliers', label: 'Nhà cung cấp', icon: <FaTruckLoading /> },
    { path: '/admin/tours', label: 'Sản phẩm Tour', icon: <FaUmbrellaBeach /> },
    { path: '/admin/bookings', label: 'Quản lý Đặt tour', icon: <FaShoppingCart /> },
    { path: '/admin/reports', label: 'Báo cáo', icon: <FaChartBar /> },
  ];

  // Hàm kiểm tra xem link có đang active không
  const isActive = (path) => {
    // Trường hợp đặc biệt cho trang Tổng quan (chỉ active khi đúng '/admin')
    if (path === '/admin') return location.pathname === '/admin';
    // Các trang khác
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col w-64 min-h-screen bg-gray-800 text-white">
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold text-center text-sky-400">TourZen Admin</h2>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-sky-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

// --- Component Layout Admin chính ---
export default function AdminDashboard() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-100 dark:bg-neutral-800">
        {/* Nội dung của các trang con sẽ được render ở đây */}
        <Routes>
          {/* Lưu ý: path ở đây là tương đối với '/admin'.
            Ví dụ: path="customers" sẽ khớp với '/admin/customers' 
          */}
          <Route path="/" element={<DashboardHome />} />
          <Route path="customers" element={<ManageCustomers />} />
          <Route path="suppliers" element={<ManageSuppliers />} />
          <Route path="tours" element={<ManageTours />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}