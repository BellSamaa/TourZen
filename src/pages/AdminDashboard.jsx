// src/pages/AdminDashboard.jsx
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  FaHome, FaUserFriends, FaTruckLoading, FaUmbrellaBeach,
  FaShoppingCart, FaChartBar, FaHotel, FaPlane, FaCar,
  FaPlus // <-- 1. Import thêm icon FaPlus
} from 'react-icons/fa';

// Import các trang
import ManageCustomers from './ManageCustomers';
import ManageSuppliers from './ManageSuppliers';
import Reports from './Reports';
import DashboardHome from './DashboardHome';
import ManageProducts from './ManageProducts';
import ManageBookings from './ManageBookings';
// 2. Import component mới
import AddToursFromData from './AddToursFromData';

const AdminSidebar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/admin', label: 'Tổng quan', icon: <FaHome /> },
    { path: '/admin/customers', label: 'Khách hàng', icon: <FaUserFriends /> },
    { path: '/admin/suppliers', label: 'Nhà cung cấp', icon: <FaTruckLoading /> },
    { path: '/admin/bookings', label: 'Quản lý Đặt chỗ', icon: <FaShoppingCart /> },
    { path: '/admin/reports', label: 'Báo cáo', icon: <FaChartBar /> },
    { type: 'divider', label: 'Sản phẩm' },
    { path: '/admin/tours', label: 'Quản lý Tours', icon: <FaUmbrellaBeach /> },
    { path: '/admin/hotels', label: 'Quản lý Khách sạn', icon: <FaHotel /> },
    { path: '/admin/flights', label: 'Quản lý Chuyến bay', icon: <FaPlane /> },
    { path: '/admin/cars', label: 'Quản lý Xe', icon: <FaCar /> },
    // 👇 3. THÊM LINK MỚI VÀO SIDEBAR 👇
    { path: '/admin/add-from-data', label: 'Thêm nhanh Tour', icon: <FaPlus /> },
  ];

  const isActive = (path) => location.pathname.startsWith(path) && path !== '/admin' || location.pathname === path;

  return (
    <div className="flex flex-col w-64 min-h-screen bg-gray-800 text-white">
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold text-center text-sky-400">TourZen Admin</h2>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item, index) => {
          if (item.type === 'divider') {
            return (
              <h3 key={index} className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {item.label}
              </h3>
            );
          }
          return (
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
          );
        })}
      </nav>
    </div>
  );
};

export default function AdminDashboard() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-100 dark:bg-neutral-900 min-h-screen">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="customers" element={<ManageCustomers />} />
          <Route path="suppliers" element={<ManageSuppliers />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="reports" element={<Reports />} />

          {/* Dùng component chung cho tất cả sản phẩm */}
          <Route path="tours" element={<ManageProducts productType="tour" />} />
          <Route path="hotels" element={<ManageProducts productType="hotel" />} />
          <Route path="flights" element={<ManageProducts productType="flight" />} />
          <Route path="cars" element={<ManageProducts productType="car_rental" />} />

          {/* 👇 4. THÊM ROUTE MỚI CHO TRANG THÊM NHANH 👇 */}
          <Route path="add-from-data" element={<AddToursFromData />} />

        </Routes>
      </main>
    </div>
  );
}