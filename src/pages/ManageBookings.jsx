// src/pages/ManageBookings.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { FaSpinner } from "react-icons/fa";

const supabase = getSupabase();

// Hàm format tiền tệ
const formatCurrency = (number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
};

// Hàm format ngày
const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleString("vi-VN", options);
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm fetch dữ liệu đặt tour
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Lấy dữ liệu từ bảng 'Bookings'
    // Đồng thời JOIN (tham gia) với bảng 'Users' và 'Products'
    // để lấy tên khách hàng và tên sản phẩm
    const { data, error } = await supabase.from("Bookings").select(`
      id,
      created_at,
      quantity,
      total_price,
      status,
      user_id,
      product_id,
      Users ( full_name ),
      Products ( name )
    `)
    .order('created_at', { ascending: false }); // Sắp xếp đơn mới nhất lên đầu

    if (error) {
      console.error("Lỗi fetch bookings:", error);
      setError(error.message);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hàm xử lý khi admin thay đổi trạng thái đơn hàng
  const handleStatusChange = async (bookingId, newStatus) => {
    // 1. Cập nhật UI ngay lập tức (để mượt mà)
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      )
    );

    // 2. Gọi Supabase để cập nhật CSDL
    const { error } = await supabase
      .from("Bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      alert("Lỗi cập nhật trạng thái: " + error.message);
      // Nếu lỗi, fetch lại dữ liệu gốc để rollback
      fetchData();
    }
    
    // Nâng cao: Nếu newStatus là 'confirmed', bạn nên trigger
    // một function để trừ tồn kho (inventory) của sản phẩm.
    // Việc này nên làm ở backend (Supabase Edge Function) để đảm bảo an toàn.
  };

  // Hàm lấy màu cho status
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-sky-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Lỗi: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Quản lý Đơn Đặt Tour/Dịch vụ
      </h1>

      <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày đặt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Số lượng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tổng giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {booking.Users ? booking.Users.full_name : "Khách vãng lai"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                    {booking.Products ? booking.Products.name : "Sản phẩm đã bị xóa"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {formatDate(booking.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {booking.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-sky-600 dark:text-sky-400">
                    {formatCurrency(booking.total_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {/* Select box để đổi trạng thái */}
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${getStatusColor(booking.status)}`}
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}