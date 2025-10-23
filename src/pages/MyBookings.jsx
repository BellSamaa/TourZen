// src/pages/MyBookings.jsx
// Trang dành cho khách hàng xem trạng thái đơn hàng của mình

import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext"; // Giả sử bạn có AuthContext để lấy user

const supabase = getSupabase();

// Helpers (copy từ ManageBookings.jsx)
const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(number);
};

const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleString("vi-VN", options);
};

const getStatusColor = (status) => {
    switch (status) {
        case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'pending': default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'confirmed': return 'Đã phê duyệt';
        case 'cancelled': return 'Đã hủy';
        case 'pending': default: return 'Chờ phê duyệt';
    }
};

export default function MyBookings() {
    const { user } = useAuth(); // Lấy user từ context
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookings = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from("Bookings")
            .select(`
                id, created_at, quantity, total_price, status,
                main_tour:Products!product_id (id, name),
                transport_service:Products!transport_product_id (id, name),
                flight_service:Products!flight_product_id (id, name)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setBookings(data || []);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    return (
        <div className="p-4 space-y-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Đơn hàng của tôi
            </h1>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-sky-600" />
                </div>
            ) : error ? (
                <div className="text-red-500 text-center p-8">Lỗi: {error}</div>
            ) : (
                <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tour/Dịch vụ chính</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dịch vụ thêm</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tổng giá</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày đặt</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                                            {booking.main_tour ? booking.main_tour.name : "N/A"}
                                            <span className="block text-xs text-gray-500 dark:text-gray-400">SL: {booking.quantity}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-300">
                                            {booking.transport_service && <div>Xe: {booking.transport_service.name}</div>}
                                            {booking.flight_service && <div>Bay: {booking.flight_service.name}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-sky-600 dark:text-sky-400">
                                            {formatCurrency(booking.total_price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`text-xs font-medium rounded-full px-3 py-1 ${getStatusColor(booking.status)}`}>
                                                {getStatusText(booking.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {formatDate(booking.created_at)}
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-gray-500 italic">
                                            Bạn chưa có đơn hàng nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}