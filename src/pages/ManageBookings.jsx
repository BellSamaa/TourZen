// src/pages/ManageBookings.jsx
// (Nội dung được nâng cấp thành "Quản lý Khách hàng")

import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { FaSpinner, FaChartBar, FaUserFriends, FaRegStar } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const supabase = getSupabase();

// --- Các hàm helpers (Giữ nguyên) ---
const formatCurrency = (number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
};

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

// --- Dữ liệu giả cho biểu đồ ---
const popularTourData = [
    { name: 'Tour Đà Nẵng', value: 400 },
    { name: 'Tour Hà Nội', value: 300 },
    { name: 'Tour TP.HCM', value: 300 },
    { name: 'Tour Phú Quốc', value: 200 },
];
const serviceUsageData = [
    { name: 'Tour', value: 500 },
    { name: 'Khách sạn', value: 250 },
    { name: 'Xe', value: 150 },
    { name: 'Chuyến bay', value: 100 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


// --- Component chính: Đổi tên logic thành Quản lý Khách hàng ---
export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm fetch dữ liệu đặt tour (Lịch sử đặt tour)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

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
    .order('created_at', { ascending: false }); 

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

  // Hàm xử lý khi admin thay đổi trạng thái đơn hàng (Giữ nguyên)
  const handleStatusChange = async (bookingId, newStatus) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      )
    );

    const { error } = await supabase
      .from("Bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      alert("Lỗi cập nhật trạng thái: " + error.message);
      fetchData();
    }
  };

  // Hàm lấy màu cho status (Giữ nguyên)
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

  return (
    <div className="p-4 space-y-8">
      {/* Tiêu đề chính */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
        Quản lý Khách hàng
      </h1>

      {/* Phần Mô tả và Thống kê */}
      <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-sky-700 dark:text-sky-400 mb-3">Tổng quan về Khách hàng</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-4xl">
            Chức năng quản lý khách hàng giúp hệ thống lưu trữ và theo dõi toàn bộ thông tin của khách hàng, bao gồm hồ sơ cá nhân, lịch sử đặt tour, phương thức thanh toán, phản hồi và đánh giá dịch vụ. Nhân viên có thể dễ dàng tra cứu, chỉnh sửa thông tin hoặc hỗ trợ khách hàng khi có yêu cầu. Bên cạnh đó, hệ thống còn cung cấp công cụ thống kê giúp TourZen nắm bắt nhu cầu và xu hướng du lịch của khách hàng, từ đó đề xuất các tour, chương trình ưu đãi hoặc chính sách chăm sóc phù hợp. Chức năng này góp phần tăng mức độ hài lòng của khách hàng và củngbền vững giữa khách hàng với doanh nghiệp.
        </p>

        {/* Thống kê nhanh & Biểu đồ (Placeholder) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Biểu đồ Tour yêu thích */}
            <div className="p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg shadow-inner">
                <h3 className="font-semibold text-gray-700 dark:text-white mb-2 flex items-center gap-2"><FaChartBar /> Tour được đặt nhiều nhất</h3>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <BarChart data={popularTourData} layout="vertical" margin={{ left: 30 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" scale="band" fontSize={12} />
                            <Tooltip formatter={(v) => `${v} lượt đặt`} />
                            <Bar dataKey="value" fill="#0ea5e9" background={{ fill: '#eee' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Biểu đồ Dịch vụ */}
            <div className="p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg shadow-inner">
                <h3 className="font-semibold text-gray-700 dark:text-white mb-2 flex items-center gap-2"><FaUserFriends /> Tỷ lệ sử dụng Dịch vụ</h3>
                <div style={{ width: '100%', height: 200 }}>
                     <ResponsiveContainer>
                        <PieChart>
                            <Pie data={serviceUsageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {serviceUsageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip formatter={(v, n) => `${v} lượt`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

             {/* Phản hồi & Đánh giá */}
            <div className="p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg shadow-inner flex flex-col justify-center items-center">
                 <h3 className="font-semibold text-gray-700 dark:text-white mb-3 flex items-center gap-2"><FaRegStar /> Phản hồi & Đánh giá</h3>
                 <div className="text-4xl font-bold text-yellow-500">4.8 <span className="text-lg text-gray-500 dark:text-gray-300">/ 5 sao</span></div>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">(Dựa trên 1,234 đánh giá)</p>
                 <button className="mt-4 px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700 transition-colors">
                    Xem chi tiết đánh giá
                 </button>
            </div>
        </div>

        {/* Placeholder cho Quản lý Hồ sơ Khách hàng */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Tra cứu & Quản lý Hồ sơ Khách hàng</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
                (Chức năng tra cứu, chỉnh sửa thông tin chi tiết hồ sơ cá nhân của khách hàng sẽ được phát triển tại đây.)
            </p>
        </div>
      </div>


      {/* Bảng Lịch sử Đặt tour (Giữ nguyên) */}
      <div>
         <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Lịch sử Đặt dịch vụ
       </h2>
    
         {loading && bookings.length === 0 ? (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tour/Dịch vụ</th>
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
                        {booking.Products ? booking.Products.name : "Tour/Dịch vụ đã bị xóa"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatDate(booking.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {booking.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-sky-600 dark:text-sky-400">
                        {formatCurrency(booking.total_price)}
                  _ </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
            _             value={booking.status}
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
         )}
      </div>
    </div>
  );
}