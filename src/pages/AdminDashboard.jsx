// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
// --- Icons ---
import {
    House, UserList, Buildings, ShoppingCartSimple,
    ChartBar, SignOut, CheckSquare // Bỏ SuitcaseSimple và PlusCircle
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaSyncAlt, FaUmbrellaBeach, FaHotel, FaPlane, FaCar, FaTags } from "react-icons/fa"; // Thêm icon
import { getSupabase } from "../lib/supabaseClient";

// --- Import các trang ---
import ManageCustomers from './ManageCustomers';
import ManageSuppliers from './ManageSuppliers';
import Reports from './Reports';
import DashboardHome from './DashboardHome';
// Bỏ import ManageProducts
import ManageBookings from './ManageBookings';
// Bỏ import AddToursFromData

const supabase = getSupabase();

// --- Component Sidebar (Đã dọn dẹp) ---
const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Cấu trúc Nav mới - GỌN GÀNG
    const navItems = [
        { path: '/admin', label: 'Tổng quan', icon: House },
        { path: '/admin/customers', label: 'Tài khoản & Khách hàng', icon: UserList },
        { path: '/admin/suppliers', label: 'Đối tác (Nhà Cung Cấp)', icon: Buildings },
        { path: '/admin/bookings', label: 'Quản lý Đặt chỗ', icon: ShoppingCartSimple },
        // Gộp Sản phẩm và Phê duyệt làm một
        { path: '/admin/products', label: 'Phê duyệt Sản phẩm', icon: CheckSquare }, 
        { path: '/admin/reports', label: 'Báo cáo & Thống kê', icon: ChartBar },
    ];

    const handleLogout = async () => { 
        await logout();
        navigate("/");
     };

    return (
        <div className="flex flex-col w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300 shadow-lg">
            {/* Header Sidebar */}
            <div className="px-5 py-6 flex items-center gap-3 border-b border-slate-700">
                <img src="/logo-icon.png" alt="Logo" className="w-8 h-8" onError={(e) => {e.target.style.display='none'}}/>
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
                         {item.icon && <item.icon size={22} weight="duotone" className={`transition-transform duration-200 ${location.pathname.startsWith(item.path) && item.path !== '/admin' || location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'}`} />}
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

// --- Component Phê duyệt (Đổi tên thành AdminProductApproval) ---
const AdminProductApproval = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // State mới để lọc

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from("Products")
                // 👇 SỬA LẠI CÂU SELECT NÀY (Bỏ alias) 👇
                .select(`*, Suppliers(name)`) // Chỉ cần JOIN
                .order("created_at", { ascending: false });

            if (filter !== 'all') {
                query = query.eq('product_type', filter);
            }
                
            const { data, error } = await query;
            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            setError("Không thể tải danh sách sản phẩm: " + err.message);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const updateStatus = async (id, status) => { /* ... giữ nguyên ... */ };

    const ApprovalBadge = ({ status }) => { /* ... giữ nguyên ... */ };

    // Helper icon cho loại sản phẩm
    const ProductIcon = ({ type }) => {
        switch (type) {
            case 'hotel': return <FaHotel className="text-blue-500" title="Khách sạn"/>;
            case 'flight': return <FaPlane className="text-indigo-500" title="Chuyến bay"/>;
            case 'car_rental': return <FaCar className="text-orange-500" title="Xe"/>;
            case 'tour':
            default: return <FaUmbrellaBeach className="text-teal-500" title="Tour"/>;
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <CheckSquare weight="duotone" className="text-sky-600" /> Phê duyệt Sản phẩm
                </h1>
                <button onClick={fetchProducts} disabled={loading} className={`flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <FaSyncAlt className={loading ? "animate-spin" : ""} /> Làm mới
                </button>
            </div>

            {/* --- Thanh Lọc Tabs --- */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {[
                        { type: 'all', label: 'Tất cả', icon: FaTags },
                        { type: 'tour', label: 'Tour', icon: FaUmbrellaBeach },
                        { type: 'hotel', label: 'Khách sạn', icon: FaHotel },
                        { type: 'flight', label: 'Chuyến bay', icon: FaPlane },
                        { type: 'car_rental', label: 'Xe', icon: FaCar }
                    ].map((tab) => {
                        const isActive = filter === tab.type;
                        return (
                            <button
                                key={tab.type}
                                onClick={() => setFilter(tab.type)}
                                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                                isActive
                                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                                }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>


            {loading && products.length === 0 ? ( 
                <div className="flex justify-center items-center min-h-[200px]">
                    <FaSpinner className="animate-spin text-4xl text-sky-600" />
                </div>
             ) : error ? ( 
                <div className="text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">{error}</div>
             ) : ( 
                <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-xl rounded-lg border dark:border-slate-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Loại</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Tên Sản phẩm</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Nhà Cung Cấp</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Giá</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {products.length > 0 ? products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ProductIcon type={product.product_type} />
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {/* 👇 SỬA LẠI CÁCH TRUY CẬP TÊN NCC 👇 */}
                                        {product.Suppliers?.name || "—"} 
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">{product.price?.toLocaleString("vi-VN") || 0} VNĐ</td>
                                    <td className="px-6 py-4 text-sm"><ApprovalBadge status={product.approval_status} /></td>
                                    <td className="px-6 py-4 text-right text-sm space-x-2">
                                        {product.approval_status === "pending" ? (
                                             <>
                                                 <button onClick={() => updateStatus(product.id, "approved")} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">Duyệt</button>
                                                 <button onClick={() => updateStatus(product.id, "rejected")} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">Từ chối</button>
                                             </>
                                         ) : (
                                            <button onClick={() => updateStatus(product.id, "pending")} className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs">Đặt lại</button>
                                         )}
                                    </td>
                                </tr>
                            )) : (
                                <tr> <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">Không có sản phẩm nào.</td> </tr>
                            )}
                        </tbody>
                    </table>
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
            <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
                <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="customers" element={<ManageCustomers />} />
                    <Route path="suppliers" element={<ManageSuppliers />} />
                    <Route path="bookings" element={<ManageBookings />} />
                    <Route path="reports" element={<Reports />} />
                    
                    {/* 👇 Sửa Route /products và /approve-tours thành /approvals 👇 */}
                    <Route path="products" element={<AdminProductApproval />} /> 

                    {/* Bỏ các route không cần nữa */}
                    {/* <Route path="add-tours-from-data" element={<AddToursFromData />} /> */}
                    {/* <Route path="approve-tours" element={<AdminApproveTours />} /> */}
                </Routes>
            </main>
        </div>
    );
}

// ApprovalBadge (nếu giữ ở đây)
const ApprovalBadge = ({ status }) => {
    const base = "px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1";
    switch (status) {
        case "approved": return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}><FaCheckCircle />Đã duyệt</span>;
        case "rejected": return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`}><FaTimesCircle />Từ chối</span>;
        default: return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}><FaSyncAlt className="animate-spin" /> Đang chờ</span>;
    }
};