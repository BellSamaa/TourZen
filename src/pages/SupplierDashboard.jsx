// src/pages/SupplierDashboard.jsx
import React from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import {
  Bed,
  CarSimple,
  AirplaneTilt,
  // CurrencyDollar, // <- XÓA
  SignOut,
  House,
  PlusCircle,
} from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";

// --- Import các trang dành riêng cho Supplier ---
import SupplierManageProducts from "./SupplierManageProducts";
import ManageTransport from "./ManageTransport";
import ManageFlights from "./ManageFlights";
// import Payment from "./Payment"; // <- XÓA
import DashboardHome from "./DashboardHome";
import SupplierAddQuickTour from "./SupplierAddQuickTour"; 

const SupplierSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: "/supplier", label: "Tổng quan", icon: House },
    { type: "divider", label: "Dịch vụ cung cấp" },
    { path: "/supplier/hotels", label: "Quản lý sản phẩm Tour", icon: Bed },
    { path: "/supplier/transport", label: "TourZenExpress (Xe)", icon: CarSimple },
    { path: "/supplier/flights", label: "Quản lý Chuyến bay", icon: AirplaneTilt },
    // { path: "/supplier/payment", label: "Giá dịch vụ & Thanh toán", icon: CurrencyDollar }, // <- XÓA
    { type: "divider", label: "Tiện ích mở rộng" },
    { path: "/supplier/add-quick-tour", label: "Thêm Tour nhanh", icon: PlusCircle }, 
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col w-64 min-h-screen bg-slate-900 text-slate-300 shadow-lg">
      {/* Header Sidebar */}
      <div className="px-5 py-6 flex items-center gap-3 border-b border-slate-700">
        <img src="/logo-icon.png" alt="Logo" className="w-8 h-8" onError={(e) => {e.target.style.display='none'}} />
        <h2 className="text-xl font-bold text-sky-400">Supplier Panel</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          if (item.type === "divider") {
            return (
              <h3
                key={index}
                className="px-3 pt-5 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {item.label}
              </h3>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/supplier"}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-sky-700 text-white font-medium shadow-inner"
                    : "hover:bg-slate-700 hover:text-white"
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
          <p
            className="text-sm font-medium text-white truncate mb-2 px-2"
            title={user.email}
          >
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

export default function SupplierDashboard() {
  return (
    <div className="flex min-h-screen">
      <SupplierSidebar />
      <main className="flex-1 p-8 bg-slate-100 dark:bg-slate-950 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardHome />} />

          {/* Quản lý dịch vụ */}
          <Route path="hotels" element={<SupplierManageProducts productType="hotel" />} />
          <Route path="transport" element={<ManageTransport />} />
          <Route path="flights" element={<ManageFlights />} />

          {/* Thanh toán & Giá */}
          {/* <Route path="payment" element={<Payment />} /> */} {/* <- XÓA */}

          {/* Route thêm mới - Thêm Tour nhanh */}
          <Route path="add-quick-tour" element={<SupplierAddQuickTour />} />
        </Routes>
      </main>
    </div>
  );
}