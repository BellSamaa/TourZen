// src/pages/DashboardHome.jsx
// (Đây là trang "Tổng quan" - SẼ NẰM BÊN TRONG AdminDashboard.jsx)
// (PHIÊN BẢN NÂNG CẤP: Hợp nhất UI từ Figma + Sửa lỗi Fetch + Tối ưu Loading)

import React, { useState, useEffect, useCallback } from 'react';
import { getSupabase } from "../lib/supabaseClient";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Users, Bank, AirplaneTilt, ArrowUp, ArrowDown, User, CircleNotch } from '@phosphor-icons/react';
import toast from 'react-hot-toast';

const supabase = getSupabase();

// --- Helper Functions ---
const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};
const formatDateShort = (dateString) => { // Dạng "dd/MM/yyyy"
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch (e) { return 'Invalid Date'; }
};
const getPaymentStatus = (status) => {
    switch (status) {
        case 'confirmed': return { text: 'Đã thanh toán', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' };
        case 'cancelled': return { text: 'Đã hủy', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' };
        case 'pending':
        default: return { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' };
    }
};


// --- (FIXED) Thẻ Thống Kê (Sửa lỗi Tailwind JIT) ---
// Truyền thẳng class thay vì dùng 'color="green"'
const StatCard = ({ title, value, change, icon, iconBgColor, iconTextColor, loading }) => {
    const isPositive = change && change.startsWith('+');
    const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
    const IconCmp = icon;

    return (
        <motion.div
            className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md border dark:border-slate-700 flex items-start justify-between"
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <div className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                    {loading ? <CircleNotch size={28} className="animate-spin text-sky-500" /> : value}
                </div>
                {change && (
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span className={changeColor}>{isPositive ? <ArrowUp size={12} weight="bold"/> : <ArrowDown size={12} weight="bold"/>} {change}</span>
                        <span>so với tháng trước</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-full ${iconBgColor}`}>
                <IconCmp size={24} className={`${iconTextColor}`} />
            </div>
        </motion.div>
    );
};

// --- Biểu đồ Doanh thu (Giả lập) ---
const simpleChartData = [
  { name: 'T1', DoanhThu: 32000000 }, { name: 'T2', DoanhThu: 41000000 }, { name: 'T3', DoanhThu: 35000000 },
  { name: 'T4', DoanhThu: 51000000 }, { name: 'T5', DoanhThu: 49000000 }, { name: 'T6', DoanhThu: 60000000 },
  { name: 'T7', DoanhThu: 62000000 }, { name: 'T8', DoanhThu: 75000000 }, { name: 'T9', DoanhThu: 71000000 },
  { name: 'T10', DoanhThu: 82000000 },
];
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
        <p className="text-sm text-sky-500">{`Doanh thu: ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};
const RevenueChart = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border dark:border-slate-700 h-[400px]">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Tổng Quan Doanh Thu</h3>
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={simpleChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} dy={10} stroke="#94a3b8" fontSize={12} />
                <YAxis tickLine={false} axisLine={false} dx={-10} stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `${value/1000000}tr`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="DoanhThu" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

// --- Component Dashboard Chính ---
export default function DashboardHome() {
    const [stats, setStats] = useState({ revenue: 0, newBookings: 0, customers: 0, activeTours: 0 });
    const [recentBookings, setRecentBookings] = useState([]);
    const [topTours, setTopTours] = useState([]);
    
    // (FIXED) Sử dụng loading state riêng biệt (từ file AdminDashboard.jsx của bạn)
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [loadingTours, setLoadingTours] = useState(true);
    const [error, setError] = useState(null);

    // (FIXED) Dùng logic fetch tuần tự (từ file AdminDashboard.jsx) vì nó ổn định và đúng
    const fetchData = useCallback(async () => {
        setLoadingStats(true);
        setLoadingBookings(true);
        setLoadingTours(true);
        setError(null);

        try {
            // --- 1. Fetch Stats ---
            const { count: customerCount, error: customerError } = await supabase
                .from('Users')
                .select('*', { count: 'exact', head: true });
            if (customerError) throw customerError;

            const { data: revenueData, error: revenueError } = await supabase
                .from('Bookings')
                .select('total_price')
                .eq('status', 'confirmed');
            if (revenueError) throw revenueError;
            const totalRevenue = revenueData.reduce((acc, b) => acc + (b.total_price || 0), 0);

            const { count: newBookingsCount, error: newBookingsError } = await supabase
                .from('Bookings')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            if (newBookingsError) throw newBookingsError;
            
            const { count: activeToursCount, error: activeToursError } = await supabase
                .from('Products')
                .select('*', { count: 'exact', head: true })
                .eq('product_type', 'tour')
                .eq('is_published', true);
            if (activeToursError) throw activeToursError;

            setStats({
                revenue: totalRevenue,
                newBookings: newBookingsCount,
                customers: customerCount,
                activeTours: activeToursCount
            });
            setLoadingStats(false);

            // --- 2. Fetch Đơn Đặt Gần Đây ---
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('Bookings')
                .select('id, created_at, total_price, status, user:Users(full_name), main_tour:Products!product_id(name, location)') 
                .order('created_at', { ascending: false })
                .limit(5);
            if (bookingsError) throw bookingsError;
            setRecentBookings(bookingsData || []);
            setLoadingBookings(false);

            // --- 3. Fetch Tour Sắp Diễn Ra (Lấy 4 tour mới nhất) ---
            const { data: toursData, error: toursError } = await supabase
                .from('Products')
                .select('id, name, location, image_url, stock, created_at')
                .eq('product_type', 'tour')
                .eq('is_published', true)
                .order('created_at', { ascending: false }) // Lấy tour mới tạo
                .limit(4);
            if (toursError) throw toursError;
            setTopTours(toursData || []);
            setLoadingTours(false);

        } catch (err) {
            console.error("Lỗi tải dữ liệu Dashboard:", err);
            setError(err.message);
            toast.error(`Lỗi tải dữ liệu: ${err.message}`);
            setLoadingStats(false);
            setLoadingBookings(false);
            setLoadingTours(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Tiêu đề */}
            <div>
                 <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Tổng quan</h1>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tổng quan về hoạt động kinh doanh du lịch</p>
            </div>

            {error && ( <div className="error-banner">{error}</div> )}

            {/* Thẻ Thống Kê (FIXED colors) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard 
                    title="Tổng Doanh Thu" 
                    value={formatCurrency(stats.revenue)} 
                    change="+12.5%" 
                    icon={Bank} 
                    iconBgColor="bg-green-100 dark:bg-green-900/30"
                    iconTextColor="text-green-600 dark:text-green-400"
                    loading={loadingStats} 
                />
                <StatCard 
                    title="Đơn Đặt Mới" 
                    value={stats.newBookings} 
                    change="+2.5%" 
                    icon={Package} 
                    iconBgColor="bg-sky-100 dark:bg-sky-900/30"
                    iconTextColor="text-sky-600 dark:text-sky-400"
                    loading={loadingStats} 
                />
                <StatCard 
                    title="Khách Hàng" 
                    value={stats.customers} 
                    change="+4.2%" 
                    icon={Users} 
                    iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
                    iconTextColor="text-indigo-600 dark:text-indigo-400"
                    loading={loadingStats} 
                />
                <StatCard 
                    title="Tour Hoạt Động" 
                    value={stats.activeTours} 
                    change="" 
                    icon={AirplaneTilt} 
                    iconBgColor="bg-orange-100 dark:bg-orange-900/30"
                    iconTextColor="text-orange-600 dark:text-orange-400"
                    loading={loadingStats} 
                />
            </div>

            {/* Biểu đồ và Tour Sắp Diễn Ra */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <RevenueChart />
                </motion.div>
                <motion.div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border dark:border-slate-700" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Tour Sắp Diễn Ra</h3>
                    {loadingTours ? (
                        <div className="text-center py-10"><CircleNotch size={24} className="animate-spin text-sky-500"/></div>
                    ) : topTours.length === 0 ? (
                         <p className="text-sm text-center text-slate-500 py-10">Không có tour nào sắp diễn ra.</p>
                    ) : (
                        <div className="space-y-4">
                            {topTours.map(tour => (
                                <Link to={`/admin/products?search=${tour.name}`} key={tour.id} className="flex items-center gap-4 group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <img src={tour.image_url || 'https://placehold.co/100x100'} alt={tour.name} className="w-16 h-12 object-cover rounded-md flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 dark:text-white truncate group-hover:text-sky-500 transition-colors">{tour.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tour.location || 'Nhiều điểm đến'}</p>
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex-shrink-0 items-center gap-1 flex">
                                        <User size={12}/> {tour.stock || 0}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

             {/* Đơn Đặt Gần Đây */}
             <motion.div
                className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white p-5 border-b dark:border-slate-700">Đơn Đặt Gần Đây</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700/40">
                             <tr>
                                <th className="th-style">Mã Đơn</th>
                                <th className="th-style">Khách hàng</th>
                                <th className="th-style">Điểm đến (Tour)</th>
                                <th className="th-style">Ngày</th>
                                <th className="th-style">Số Tiền</th>
                                <th className="th-style">Trạng Thái</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y dark:divide-slate-700">
                             {loadingBookings ? (
                                 <tr><td colSpan="6" className="td-center"><CircleNotch size={24} className="animate-spin text-sky-500"/></td></tr>
                             ) : recentBookings.length === 0 ? (
                                 <tr><td colSpan="6" className="td-center italic text-slate-500">Không có đơn đặt nào gần đây.</td></tr>
                             ) : (
                                recentBookings.map((b, index) => {
                                    const paymentStatus = getPaymentStatus(b.status);
                                    return (
                                        <motion.tr
                                            key={b.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.1 * index }} // Hiệu ứng xuất hiện
                                        >
                                            <td className="td-style font-mono text-xs">#{b.id.slice(-6).toUpperCase()}</td>
                                            <td className="td-style font-medium dark:text-white">{b.user?.full_name || 'N/A'}</td>
                                            <td className="td-style whitespace-normal">{b.main_tour?.name || 'N/A'}</td>
                                            <td className="td-style text-slate-500">{formatDateShort(b.created_at)}</td>
                                            <td className="td-style font-medium text-sky-600 dark:text-sky-400">{formatCurrency(b.total_price)}</td>
                                            <td className="td-style">
                                                <span className={`status-badge ${paymentStatus.color}`}>{paymentStatus.text}</span>
                                            </td>
                                        </motion.tr>
                                    )
                                })
                             )}
                         </tbody>
                    </table>
                 </div>
             </motion.div>
             
             {/* CSS */}
             <style jsx>{`
                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap; }
                .td-style { @apply px-6 py-4 text-sm align-middle; }
                .td-center { @apply px-6 py-8 text-center; }
                .status-badge { @apply text-xs font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap; }
                .error-banner { @apply bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/30 dark:border-red-700 dark:text-red-300; }
             `}</style>

        </motion.div>
    );
}