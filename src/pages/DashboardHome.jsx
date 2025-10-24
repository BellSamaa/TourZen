// src/pages/DashboardHome.jsx
import React, { useState, useEffect } from 'react';
import { getSupabase } from "../lib/supabaseClient";
import { Link } from 'react-router-dom';
import { FaSpinner, FaChartLine, FaBoxOpen, FaUserPlus, FaShoppingCart, FaFileInvoiceDollar } from "react-icons/fa";

const supabase = getSupabase();

// --- Helper Functions ---
const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'; // Handle null/undefined dates
    const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
    try {
        return new Date(dateString).toLocaleString("vi-VN", options);
    } catch (e) {
        console.error("Invalid date string for formatting:", dateString, e);
        return 'Invalid Date';
    }
};

// --- Component Card Thống kê ---
const StatCard = ({ title, value, icon, colorClass, loading }) => (
    <div className={`p-6 rounded-2xl shadow-lg border ${colorClass} bg-white dark:bg-neutral-800`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p> {/* <<< Thêm tracking-wider */}
                {loading ? (
                    <FaSpinner className="animate-spin text-2xl mt-2 text-gray-400" />
                ) : (
                    <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
                )}
            </div>
            <div className={`p-3 rounded-full ${colorClass.replace('border-', 'bg-').replace('dark:border-', 'dark:bg-')} bg-opacity-10 dark:bg-opacity-20`}> {/* <<< Tự động lấy màu nền nhạt */}
                {React.cloneElement(icon, { size: 22 })} {/* <<< Đảm bảo size icon nhất quán */}
            </div>
        </div>
    </div>
);

// --- Component Chính ---
export default function DashboardHome() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        monthlyRevenue: 0,
        monthlyBookings: 0,
        pendingProducts: 0,
        newUsers: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [error, setError] = useState(null); // <<< Thêm state lỗi

    useEffect(() => {
        async function fetchKpis() {
            setLoading(true);
            setError(null); // Reset lỗi
            // Lấy ngày đầu tiên của tháng hiện tại
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            try {
                // Sử dụng Promise.all để fetch song song
                const [bookingRes, pendingRes, userRes, recentRes] = await Promise.all([
                    // 1. Doanh thu & Đơn hàng tháng này ('confirmed')
                    supabase
                        .from('Bookings')
                        .select('total_price')
                        .eq('status', 'confirmed')
                        .gte('created_at', startOfMonth),
                    // 2. Số sản phẩm chờ duyệt (tất cả loại)
                    supabase
                        .from('Products')
                        .select('id', { count: 'exact', head: true })
                        .eq('approval_status', 'pending'),
                    // 3. Số người dùng mới tháng này
                    supabase
                        .from('Users')
                        .select('id', { count: 'exact', head: true })
                        .gte('created_at', startOfMonth),
                    // 4. 5 đơn hàng mới nhất (lấy đủ thông tin cần thiết)
                    supabase
                        .from("Bookings")
                        .select(`
                            id, created_at, total_price, status,
                            user:Users ( full_name ),
                            main_tour:Products!product_id ( name )
                        `)
                        .order('created_at', { ascending: false })
                        .limit(5)
                ]);

                // Xử lý kết quả
                if (bookingRes.error) throw bookingRes.error;
                if (pendingRes.error) throw pendingRes.error;
                if (userRes.error) throw userRes.error;
                if (recentRes.error) throw recentRes.error;

                const monthlyRevenue = (bookingRes.data || []).reduce((sum, b) => sum + (b.total_price || 0), 0);
                const monthlyBookings = (bookingRes.data || []).length;

                setStats({
                    monthlyRevenue: monthlyRevenue,
                    monthlyBookings: monthlyBookings,
                    pendingProducts: pendingRes.count || 0,
                    newUsers: userRes.count || 0
                });
                setRecentBookings(recentRes.data || []);

            } catch (error) {
                console.error("Lỗi tải dữ liệu Dashboard:", error);
                setError("Không thể tải dữ liệu tổng quan. Vui lòng thử lại."); // <<< Set lỗi
                // Reset state nếu lỗi
                setStats({ monthlyRevenue: 0, monthlyBookings: 0, pendingProducts: 0, newUsers: 0 });
                setRecentBookings([]);
            } finally {
                setLoading(false);
            }
        }

        fetchKpis();
    }, []); // Chỉ chạy 1 lần khi mount


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Tổng quan
            </h1>

            {/* Hiển thị lỗi nếu có */}
            {error && (
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/30 dark:border-red-700 dark:text-red-300" role="alert">
                    <strong className="font-bold">Lỗi!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                 </div>
            )}

            {/* === 1. Các thẻ KPIs === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={`Doanh thu (T${new Date().getMonth() + 1})`}
                    value={formatCurrency(stats.monthlyRevenue)}
                    icon={<FaFileInvoiceDollar className="text-green-600" />} // <<< Bỏ size ở đây
                    colorClass="border-green-200 dark:border-green-700"
                    loading={loading}
                />
                <StatCard
                    title={`Đơn hàng (T${new Date().getMonth() + 1})`}
                    value={stats.monthlyBookings}
                    icon={<FaShoppingCart className="text-sky-600" />}
                    colorClass="border-sky-200 dark:border-sky-700"
                    loading={loading}
                />
                <StatCard
                    title="Sản phẩm chờ duyệt"
                    value={stats.pendingProducts}
                    icon={<FaBoxOpen className="text-yellow-600" />}
                    colorClass="border-yellow-200 dark:border-yellow-700"
                    loading={loading}
                />
                <StatCard
                    title="Người dùng mới (Tháng)"
                    value={stats.newUsers}
                    icon={<FaUserPlus className="text-indigo-600" />}
                    colorClass="border-indigo-200 dark:border-indigo-700"
                    loading={loading}
                />
            </div>

            {/* === 2. Cập nhật mới (Đơn hàng gần đây) === */}
            <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg border dark:border-neutral-700">
                <div className="p-5 border-b border-gray-200 dark:border-neutral-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Đơn hàng gần đây
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">5 đơn hàng vừa được tạo hoặc cập nhật.</p>
                </div>

                {/* Chỉ hiển thị loading spinner nếu đang load lần đầu */}
                {loading && recentBookings.length === 0 && !error ? (
                    <div className="p-10 text-center"><FaSpinner className="animate-spin text-3xl mx-auto text-gray-400" /></div>
                ) : !loading && recentBookings.length === 0 && !error ? ( // Hiển thị khi không có đơn hàng nào
                    <p className="p-10 text-center text-gray-500 italic">Chưa có đơn hàng nào gần đây.</p>
                ) : ( // Hiển thị danh sách đơn hàng
                    <div className="flow-root">
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-neutral-700">
                            {recentBookings.map(booking => (
                                <li key={booking.id} className="p-5 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            {/* Icon dựa trên status */}
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                                booking.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900' :
                                                booking.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900' :
                                                'bg-yellow-100 dark:bg-yellow-900'
                                            }`}>
                                                <FaShoppingCart className={`h-5 w-5 ${
                                                    booking.status === 'confirmed' ? 'text-green-600 dark:text-green-400' :
                                                    booking.status === 'cancelled' ? 'text-red-600 dark:text-red-400' :
                                                    'text-yellow-600 dark:text-yellow-400'
                                                }`} />
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {/* Hiển thị tên tour trước */}
                                                {booking.main_tour?.name || 'Tour đã bị xóa'}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                Đặt bởi: {booking.user?.full_name || 'Khách vãng lai'}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0 whitespace-nowrap">
                                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(booking.total_price)}
                                            </p>
                                             <p className="text-xs text-gray-400 mt-0.5">
                                                {formatDate(booking.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 {/* Link xem tất cả chỉ hiện khi không loading và có lỗi hoặc có đơn hàng */}
                 {(!loading || recentBookings.length > 0) && (
                     <div className="p-4 text-center bg-gray-50 dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700 rounded-b-lg">
                        {/* <<< Sửa link đến trang Quản lý Đặt Tour >>> */}
                        <Link to="/admin/tours" className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
                            Xem tất cả đơn đặt tour &rarr;
                        </Link>
                    </div>
                 )}
            </div>
        </div>
    );
}