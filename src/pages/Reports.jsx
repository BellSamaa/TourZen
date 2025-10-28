// src/pages/Reports.jsx
// (Đây là trang "Báo cáo" - SẼ NẰM BÊN TRONG AdminDashboard.jsx)
// (UPGRADED: Thêm hiệu ứng Hover đồng bộ)

import React, { useState, useEffect, useMemo } from 'react';
import { getSupabase } from "../lib/supabaseClient";
import { CircleNotch, ChartBar as ChartBarIcon, ChartPie as ChartPieIcon } from "@phosphor-icons/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { motion } from 'framer-motion';
import toast from 'react-hot-toast'; // Thêm toast để báo lỗi

const supabase = getSupabase();
const COLORS = ['#0ea5e9', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']; // Màu Sky-500

// Format tiền rút gọn (cho trục Y)
const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    if (number >= 1000000000) {
        return `${(number / 1000000000).toFixed(1)} tỷ`;
    }
    if (number >= 1000000) {
        return `${(number / 1000000).toFixed(1)} tr`;
    }
    if (number >= 1000) {
         return `${(number / 1000).toFixed(0)} k`;
    }
    return new Intl.NumberFormat("vi-VN").format(number);
};

// Format tiền đầy đủ (cho Tooltip)
const formatFullCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
}

// Component tùy chỉnh cho Tooltip (Giữ nguyên)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
        <p className="text-sm text-sky-500">{`Doanh thu: ${formatFullCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

// --- Component Chính ---
export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [confirmedBookings, setConfirmedBookings] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchReportData() {
            setLoading(true);
            try {
                // Sửa logic fetch để join đúng
                const { data, error: fetchError } = await supabase
                    .from('Bookings')
                    .select(`
                        total_price,
                        main_tour:Products (
                            name,
                            supplier:Suppliers ( name )
                        )
                    `)
                    .eq('status', 'confirmed');
                
                if (fetchError) throw fetchError;
                setConfirmedBookings(data || []);

            } catch (err) {
                console.error("Lỗi tải dữ liệu báo cáo:", err);
                setError(err.message);
                toast.error(`Lỗi tải báo cáo: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }
        fetchReportData();
    }, []);

    // --- Xử lý dữ liệu bằng useMemo (Giữ nguyên) ---
    const { revenueByTour, revenueBySupplier } = useMemo(() => {
         const tourStats = {};
        const supplierStats = {};
        for (const booking of confirmedBookings) {
            // Kiểm tra join lồng
            if (!booking.main_tour) continue;
            
            const tourName = booking.main_tour.name || 'Tour không tên';
            // Kiểm tra join lồng 2 lớp
            const supplierName = booking.main_tour.supplier?.name || 'NCC không rõ';
            const price = booking.total_price;

            if (!tourStats[tourName]) { tourStats[tourName] = 0; }
            tourStats[tourName] += price;
            
            if (!supplierStats[supplierName]) { supplierStats[supplierName] = 0; }
            supplierStats[supplierName] += price;
        }
        
        const revenueByTour = Object.entries(tourStats)
            .map(([name, revenue]) => ({ name, revenue }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10); // Lấy top 10
            
        const revenueBySupplier = Object.entries(supplierStats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
            
        return { revenueByTour, revenueBySupplier };
    }, [confirmedBookings]);


    if (loading) {
        return <div className="flex justify-center items-center h-[calc(100vh-150px)]"><CircleNotch size={40} className="animate-spin text-sky-500" /></div>;
    }
    if (error) {
         return <div className="error-banner">Lỗi tải báo cáo: {error}</div>;
    }

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Tiêu đề */}
            <div>
                 <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Báo cáo & Thống kê</h1>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Phân tích doanh thu theo tour và nhà cung cấp</p>
            </div>

            {/* === 1. Biểu đồ Doanh thu theo Tour (UPGRADED: Thêm Hover) === */}
            <motion.div
                className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 border dark:border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }} // <-- NÂNG CẤP HIỆU ỨNG
            >
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <ChartBarIcon size={24} weight="duotone" className="text-sky-500" /> Top 10 Tour có Doanh thu cao nhất
                </h2>
                {revenueByTour.length === 0 ? (
                    <p className="text-center text-gray-500 italic py-10">Chưa có dữ liệu doanh thu tour.</p>
                ) : (
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart data={revenueByTour} layout="vertical" margin={{ left: 50, right: 20 }}>
                                <XAxis type="number" tickFormatter={formatCurrency} hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={150} 
                                    tick={{ fontSize: 12, fill: 'rgb(100 116 139)' }}
                                    axisLine={false}
                                    tickLine={false}
                                    className="dark:text-slate-400"
                                    interval={0} // Hiển thị tất cả các nhãn
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }} />
                                <Bar dataKey="revenue" fill="#0ea5e9" background={{ fill: '#f1f5f9', fillOpacity: 0.5 }} radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </motion.div>

            {/* === 2. Biểu đồ Tỷ trọng Doanh thu theo NCC (UPGRADED: Thêm Hover) === */}
            <motion.div
                className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 border dark:border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }} // <-- NÂNG CẤP HIỆU ỨNG
            >
                 <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <ChartPieIcon size={24} weight="duotone" className="text-indigo-500" /> Tỷ trọng Doanh thu theo NCC
                </h2>
                {revenueBySupplier.length === 0 ? (
                    <p className="text-center text-gray-500 italic py-10">Chưa có dữ liệu doanh thu nhà cung cấp.</p>
                ) : (
                     <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={revenueBySupplier}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={140}
                                    fill="#8884d8"
                                    labelLine={false}
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {revenueBySupplier.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatFullCurrency(value)} />
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                     </div>
                )}
            </motion.div>
            
            {/* CSS */}
             <style jsx>{`
                .error-banner { @apply bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/30 dark:border-red-700 dark:text-red-300; }
             `}</style>
        </motion.div>
    );
}