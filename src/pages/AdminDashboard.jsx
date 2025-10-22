// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
// --- Icons ---
import {
    House, UserList, Buildings, SuitcaseSimple, ShoppingCartSimple,
    ChartBar, PlusCircle, SignOut
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaSyncAlt, FaUmbrellaBeach } from "react-icons/fa";
import { getSupabase } from "../lib/supabaseClient";

// --- Import các trang ---
import ManageCustomers from './ManageCustomers';
import ManageSuppliers from './ManageSuppliers';
import Reports from './Reports';
import DashboardHome from './DashboardHome';
import ManageProducts from "./AdminManageProducts";
import ManageBookings from './ManageBookings';
import AddToursFromData from './AddToursFromData';

const supabase = getSupabase();

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
        { path: '/admin/approve-tours', label: 'Phê duyệt Tour', icon: SuitcaseSimple },
        { path: '/admin/reports', label: 'Báo cáo & Thống kê', icon: ChartBar },
    ];

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <div className="flex flex-col w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300 shadow-lg">
            <div className="px-5 py-6 flex items-center gap-3 border-b border-slate-700">
                <img src="/logo-icon.png" alt="Logo" className="w-8 h-8"/>
                <h2 className="text-xl font-bold text-sky-400">TourZen Admin</h2>
            </div>

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
                        {item.icon && <item.icon size={22} weight="duotone" className={`transition-transform duration-200 ${location.pathname.startsWith(item.path) && item.path !== '/admin' || location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'}`} />}
                        <span className="text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

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

// --- Component Phê duyệt Tour ---
const AdminApproveTours = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTours = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from("Products")
                .select(`*, supplier_name:Suppliers(name)`)
                .eq("product_type", "tour")
                .order("created_at", { ascending: false });
            if (error) throw error;
            setTours(data || []);
        } catch (err) {
            setError("Không thể tải danh sách tour: " + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTours(); }, [fetchTours]);

    const updateStatus = async (id, status) => {
        if (status === "pending" || window.confirm(`Xác nhận đổi trạng thái thành "${status}"?`)) {
            const { error } = await supabase
                .from("Products")
                .update({ approval_status: status })
                .eq("id", id);
            if (error) alert("Lỗi: " + error.message);
            else fetchTours();
        }
    };

    const ApprovalBadge = ({ status }) => {
        const base = "px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1";
        switch (status) {
            case "approved": return <span className={`${base} bg-green-100 text-green-800`}><FaCheckCircle />Đã duyệt</span>;
            case "rejected": return <span className={`${base} bg-red-100 text-red-800`}><FaTimesCircle />Từ chối</span>;
            default: return <span className={`${base} bg-yellow-100 text-yellow-800`}><FaSyncAlt className="animate-spin-slow" />Đang chờ</span>;
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <FaUmbrellaBeach className="text-sky-600" /> Phê duyệt Tour từ Nhà Cung Cấp
                </h1>
                <button onClick={fetchTours} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">
                    <FaSyncAlt /> Làm mới
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <FaSpinner className="animate-spin text-4xl text-sky-600" />
                </div>
            ) : error ? (
                <div className="text-red-500 text-center bg-red-50 p-6 rounded-lg">{error}</div>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-xl rounded-lg border dark:border-slate-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Mã Tour</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Tên Tour</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Nhà Cung Cấp</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Giá</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {tours.length ? tours.map(tour => (
                                <tr key={tour.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-500">{tour.tour_code || "N/A"}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{tour.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{tour.supplier_name?.name || "—"}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">{tour.price?.toLocaleString("vi-VN") || 0} VNĐ</td>
                                    <td className="px-6 py-4 text-sm"><ApprovalBadge status={tour.approval_status} /></td>
                                    <td className="px-6 py-4 text-right text-sm space-x-2">
                                        {tour.approval_status === "pending" ? (
                                            <>
                                                <button onClick={() => updateStatus(tour.id, "approved")} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Duyệt</button>
                                                <button onClick={() => updateStatus(tour.id, "rejected")} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Từ chối</button>
                                            </>
                                        ) : (
                                            <button onClick={() => updateStatus(tour.id, "pending")} className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">Đặt lại</button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">Không có tour nào cần phê duyệt.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
                    <Route path="products" element={<ManageProducts />} />
                    <Route path="add-tours-from-data" element={<AddToursFromData />} />
                    {/* Route mới: Phê duyệt tour */}
                    <Route path="approve-tours" element={<AdminApproveTours />} />
                </Routes>
            </main>
        </div>
    );
}
