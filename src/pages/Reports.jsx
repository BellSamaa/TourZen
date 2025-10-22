// src/pages/Reports.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getSupabase } from "../lib/supabaseClient";
import { FaSpinner, FaChartBar, FaChartPie } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const supabase = getSupabase();
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN").format(number);
};

// Component tùy chỉnh cho Tooltip (để hiển thị VNĐ)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-neutral-800 border dark:border-neutral-600 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
        <p className="text-sm text-green-600">{`Doanh thu: ${formatCurrency(payload[0].value)}`}</p>
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
                // Lấy TẤT CẢ các đơn hàng ĐÃ XÁC NHẬN
                // và join với tên Tour, tên Nhà Cung Cấp
                const { data, error } = await supabase
                    .from('Bookings')
                    .select(`
                        total_price,
                        main_tour:Products!product_id (
                            name,
                            supplier:Suppliers ( name )
                        )
                    `)
                    .eq('status', 'confirmed');
                
                if (error) throw error;
                setConfirmedBookings(data || []);

            } catch (err) {
                console.error("Lỗi tải dữ liệu báo cáo:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchReportData();
    }, []);

    // --- Xử lý dữ liệu bằng useMemo ---
    const { revenueByTour, revenueBySupplier } = useMemo(() => {
        const tourStats = {};    // { "Tour Đà Lạt": 1000 }
        const supplierStats = {}; // { "Saigontourist": 1500 }

        for (const booking of confirmedBookings) {
            if (!booking.main_tour) continue; // Bỏ qua nếu không có tour

            const tourName = booking.main_tour.name || 'Tour không tên';
            const supplierName = booking.main_tour.supplier?.name || 'NCC không rõ';
            const price = booking.total_price;

            // 1. Thống kê theo Tour
            if (!tourStats[tourName]) {
                tourStats[tourName] = 0;
            }
            tourStats[tourName] += price;

            // 2. Thống kê theo NCC
            if (!supplierStats[supplierName]) {
                supplierStats[supplierName] = 0;
            }
            supplierStats[supplierName] += price;
        }

        // Chuyển đổi sang định dạng của Recharts và sắp xếp
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
        return <div className="flex justify-center items-center min-h-[400px]"><FaSpinner className="animate-spin text-4xl text-sky-600" /></div>;
    }
    if (error) {
         return <div className="text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">Lỗi tải báo cáo: {error}</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Báo cáo & Thống kê
            </h1>

            {/* === 1. Biểu đồ Doanh thu theo Tour === */}
            <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg p-6 border dark:border-neutral-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <FaChartBar className="text-sky-500" /> Top 10 Tour có Doanh thu cao nhất
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
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
                                <Bar dataKey="revenue" fill="#0ea5e9" background={{ fill: '#f1f5f9' }} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* === 2. Biểu đồ Tỷ trọng Doanh thu theo NCC === */}
            <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg p-6 border dark:border-neutral-700">
                 <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <FaChartPie className="text-indigo-500" /> Tỷ trọng Doanh thu theo Nhà Cung Cấp
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
                                    outerRadius={150}
                                    fill="#8884d8"
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {revenueBySupplier.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                     </div>
                )}
            </div>

        </div>
    );
}