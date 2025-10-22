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
    const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleString("vi-VN", options);
};

// --- Component Card Thống kê ---
const StatCard = ({ title, value, icon, colorClass, loading }) => (
    <div className={`p-6 rounded-2xl shadow-lg border ${colorClass} bg-white dark:bg-neutral-800`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
                {loading ? (
                    <FaSpinner className="animate-spin text-2xl mt-2 text-gray-400" />
                ) : (
                    <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
                )}
            </div>
            <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
                {icon}
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

    useEffect(() => {
        async function fetchKpis() {
            setLoading(true);
            
            // Lấy ngày đầu tiên của tháng hiện tại (Tháng 10)
            const now = new Date(); // Giả sử là 23/10/2025
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            try {
                // 1. Lấy Doanh thu & Đơn hàng tháng này (chỉ đơn 'confirmed')
                const { data: bookingData, error: bookingError } = await supabase
                    .from('Bookings')
                    .select('total_price')
                    .eq('status', 'confirmed')
                    .gte('created_at', startOfMonth);
                if (bookingError) throw bookingError;
                
                const monthlyRevenue = bookingData.reduce((sum, b) => sum + b.total_price, 0);
                const monthlyBookings = bookingData.length;

                // 2. Lấy số sản phẩm chờ duyệt
                const { count: pendingCount, error: pendingError } = await supabase
                    .from('Products')
                    .select('id', { count: 'exact', head: true })
                    .eq('approval_status', 'pending');
                if (pendingError) throw pendingError;

                // 3. Lấy số người dùng mới tháng này
                const { count: userCount, error: userError } = await supabase
                    .from('Users')
                    .select('id', { count: 'exact', head: true })
                    .gte('created_at', startOfMonth);
                if (userError) throw userError;

                // 4. Lấy 5 đơn hàng mới nhất
                const { data: recentData, error: recentError } = await supabase
                    .from("Bookings")
                    .select(`
                        id, created_at, total_price, status,
                        user:Users ( full_name ), 
                        main_tour:Products!product_id ( name )
                    `)
                    .order('created_at', { ascending: false })
                    .limit(5);
                if (recentError) throw recentError;

                setStats({
                    monthlyRevenue: monthlyRevenue,
                    monthlyBookings: monthlyBookings,
                    pendingProducts: pendingCount || 0,
                    newUsers: userCount || 0
                });
                setRecentBookings(recentData || []);

            } catch (error) {
                console.error("Lỗi tải dữ liệu Dashboard:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchKpis();
    }, []);


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Tổng quan
            </h1>

            {/* === 1. Các thẻ KPIs (Thống kê nhanh) === */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={`Doanh thu (T${new Date().getMonth() + 1})`}
                    value={formatCurrency(stats.monthlyRevenue)}
                    icon={<FaFileInvoiceDollar size={22} className="text-green-600" />}
                    colorClass="border-green-200 dark:border-green-700"
                    loading={loading}
                />
                <StatCard
                    title={`Đơn hàng (T${new Date().getMonth() + 1})`}
                    value={stats.monthlyBookings}
                    icon={<FaShoppingCart size={22} className="text-sky-600" />}
                    colorClass="border-sky-200 dark:border-sky-700"
                    loading={loading}
                />
                <StatCard
                    title="Sản phẩm chờ duyệt"
                    value={stats.pendingProducts}
                    icon={<FaBoxOpen size={22} className="text-yellow-600" />}
                    colorClass="border-yellow-200 dark:border-yellow-700"
                    loading={loading}
                />
                <StatCard
                    title="Người dùng mới (Tháng)"
                    value={stats.newUsers}
                    icon={<FaUserPlus size={22} className="text-indigo-600" />}
                    colorClass="border-indigo-200 dark:border-indigo-700"
                    loading={loading}
                />
            </div>

            {/* === 2. Cập nhật mới (Đơn hàng gần đây) === */}
            <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg border dark:border-neutral-700">
                <div className="p-5 border-b border-gray-200 dark:border-neutral-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Cập nhật mới
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Các đơn hàng vừa được tạo gần đây.</p>
                </div>
                
                {loading && recentBookings.length === 0 ? (
                    <div className="p-10 text-center"><FaSpinner className="animate-spin text-2xl mx-auto text-gray-400" /></div>
                ) : (
                    <div className="flow-root">
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-neutral-700">
                            {recentBookings.map(booking => (
                                <li key={booking.id} className="p-5 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
                                                <FaShoppingCart className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {booking.user?.full_name || 'Khách vãng lai'}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                Đã đặt tour: {booking.main_tour?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-green-600">
                                                {formatCurrency(booking.total_price)}
                                            </p>
                                             <p className="text-xs text-gray-400">
                                                {formatDate(booking.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 <div className="p-4 text-center bg-gray-50 dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700">
                    <Link to="/admin/bookings" className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
                        Xem tất cả đơn hàng &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}