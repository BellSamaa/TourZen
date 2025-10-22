// src/pages/ManageBookings.jsx
// (Nội dung được nâng cấp thành "Quản lý Khách hàng" & Admin)

import React, { useState, useEffect, useCallback, useMemo } in "react";
import { getSupabase } from "../lib/supabaseClient";
import { 
    FaSpinner, FaChartBar, FaUserFriends, FaRegStar, FaSearch, 
    FaCheckCircle, FaTimesCircle, FaClock 
} from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const supabase = getSupabase();

// --- Các hàm helpers (Giữ nguyên) ---
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// --- Component con: Hàng chờ Phê duyệt Sản phẩm (Tính năng Mới) ---
const ProductApprovalQueue = () => {
    const [pendingProducts, setPendingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPendingProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('Products')
            .select('*, supplier:Suppliers(name)') // Lấy cả tên nhà cung cấp
            .eq('approval_status', 'pending')
            .order('created_at', { ascending: true });

        if (error) {
            console.error("Lỗi fetch sản phẩm chờ duyệt:", error);
            setError(error.message);
        } else {
            setPendingProducts(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPendingProducts();
    }, [fetchPendingProducts]);

    const handleApproval = async (productId, newStatus) => {
        // Cập nhật UI ngay lập tức
        setPendingProducts(prev => prev.filter(p => p.id !== productId));

        const { error } = await supabase
            .from('Products')
            .update({ approval_status: newStatus })
            .eq('id', productId);
        
        if (error) {
            alert("Lỗi cập nhật sản phẩm: " + error.message);
            fetchPendingProducts(); // Tải lại nếu có lỗi
        }
    };

    if (loading) {
        return <div className="p-4 text-center dark:text-gray-300">Đang tải danh sách chờ duyệt...</div>
    }
    if (error) {
         return <div className="p-4 text-center text-red-500">Lỗi: {error}</div>
    }
    if (pendingProducts.length === 0) {
        return (
             <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-center">
                <FaCheckCircle className="mx-auto text-3xl text-green-500 mb-2" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">Tuyệt vời!</h3>
                <p className="text-sm text-green-700 dark:text-green-300">Không có sản phẩm nào đang chờ duyệt.</p>
            </div>
        )
    }

    // Hiển thị bảng nếu có sản phẩm chờ
    return (
        <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                <FaClock className="inline mr-2 text-yellow-500" /> Hàng chờ Phê duyệt
             </h2>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Sản phẩm</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Loại</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">NCC</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Giá</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {pendingProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{product.product_type}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.supplier?.name || 'N/A'}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-sky-600 dark:text-sky-400">{formatCurrency(product.price)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center space-x-2">
                                    <button onClick={() => handleApproval(product.id, 'approved')} className="p-2 text-green-500 hover:text-green-700" title="Duyệt">
                                        <FaCheckCircle size={18} />
                                    </button>
                                    <button onClick={() => handleApproval(product.id, 'rejected')} className="p-2 text-red-500 hover:text-red-700" title="Từ chối">
                                        <FaTimesCircle size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    );
};


// --- Component chính: Quản lý Khách hàng ---
export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // State cho tìm kiếm

  // --- SỬA LỖI 400 TẠI ĐÂY ---
  // Cập nhật hàm fetch để lấy tất cả dịch vụ và sửa lỗi
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Sửa câu select để chỉ định rõ ràng các mối quan hệ
    const { data, error } = await supabase
    .from("Bookings")
    .select(`
        id, created_at, quantity, total_price, status, user_id,
        user:Users ( id, full_name, email ), 
        main_tour:Products!product_id ( id, name, product_type ),
        transport_service:Products!transport_product_id ( id, name, product_type ),
        flight_service:Products!flight_product_id ( id, name, product_type )
    `)
    .order('created_at', { ascending: false }); 
    // --- KẾT THÚC SỬA LỖI ---

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

  // --- TÍNH NĂNG MỚI: Phân tích dữ liệu từ 'bookings' ---
  const { topCustomers, popularProducts, serviceTypeUsage } = useMemo(() => {
    const customerStats = {}; // { userId: { name, email, count, total_spent } }
    const productStats = {};  // { productId: { name, value } }
    const typeStats = { tour: 0, transport: 0, flight: 0 };

    for (const booking of bookings) {
        // 1. Thống kê khách hàng
        if (booking.user) {
            const u = booking.user;
            if (!customerStats[u.id]) {
                customerStats[u.id] = { id: u.id, name: u.full_name || 'N/A', email: u.email, count: 0, total_spent: 0 };
            }
            customerStats[u.id].count += 1;
            customerStats[u.id].total_spent += booking.total_price;
        }

        // 2. Thống kê sản phẩm (Tour, Xe, Bay)
        const services = [booking.main_tour, booking.transport_service, booking.flight_service];
        for (const service of services) {
            if (service) {
                if (!productStats[service.id]) {
                    productStats[service.id] = { name: service.name, value: 0 };
                }
                productStats[service.id].value += 1;

                // 3. Thống kê loại dịch vụ
                if (service.product_type === 'tour') typeStats.tour += 1;
                else if (service.product_type === 'transport') typeStats.transport += 1;
                else if (service.product_type === 'flight') typeStats.flight += 1;
            }
        }
    }

    // Chuyển đổi và Sắp xếp
    const topCustomers = Object.values(customerStats).sort((a, b) => b.count - a.count).slice(0, 5);
    const popularProducts = Object.values(productStats).sort((a, b) => b.value - a.value).slice(0, 5);
    const serviceTypeUsage = [
        { name: 'Tour', value: typeStats.tour },
        { name: 'Xe', value: typeStats.transport },
        { name: 'Chuyến bay', value: typeStats.flight },
    ].filter(d => d.value > 0); // Chỉ hiển thị loại được sử dụng

    return { topCustomers, popularProducts, serviceTypeUsage };
  }, [bookings]);
  // --- KẾT THÚC TÍNH NĂNG MỚI ---


  // --- TÍNH NĂNG MỚI: Lọc danh sách booking theo tên khách hàng ---
  const filteredBookings = useMemo(() => {
      if (!searchTerm) return bookings;
      return bookings.filter(b => 
          b.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [bookings, searchTerm]);


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
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending': default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
	}
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
        Quản lý Khách hàng & Hệ thống
      </h1>

      {/* Phần Mô tả và Thống kê (DỮ LIỆU ĐỘNG) */}
      <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-sky-700 dark:text-sky-400 mb-3">Tổng quan (Dữ liệu động)</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-4xl">
            Phần này cung cấp thống kê động dựa trên lịch sử đặt dịch vụ của khách hàng.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Biểu đồ Dịch vụ được đặt nhiều (ĐỘNG) */}
            <div className="p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg shadow-inner">
                <h3 className="font-semibold text-gray-700 dark:text-white mb-2 flex items-center gap-2"><FaChartBar /> Dịch vụ được đặt nhiều nhất</h3>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <BarChart data={popularProducts} layout="vertical" margin={{ left: 30 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" scale="band" fontSize={12} width={100} tick={{ fill: 'rgb(156 163 175)' }} />
                            <Tooltip formatter={(v) => `${v} lượt đặt`} wrapperStyle={{ zIndex: 10 }} />
                            <Bar dataKey="value" fill="#0ea5e9" background={{ fill: '#eee' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Biểu đồ Tỷ lệ Dịch vụ (ĐỘNG) */}
            <div className="p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg shadow-inner">
                <h3 className="font-semibold text-gray-700 dark:text-white mb-2 flex items-center gap-2"><FaUserFriends /> Tỷ lệ sử dụng Dịch vụ</h3>
                <div style={{ width: '100%', height: 200 }}>
                     <ResponsiveContainer>
                        <PieChart>
                            <Pie data={serviceTypeUsage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {serviceTypeUsage.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip formatter={(v, n) => `${v} lượt`} wrapperStyle={{ zIndex: 10 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

             {/* Phản hồi & Đánh giá (Tạm giữ) */}
            <div className="p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg shadow-inner flex flex-col justify-center items-center">
                 <h3 className="font-semibold text-gray-700 dark:text-white mb-3 flex items-center gap-2"><FaRegStar /> Phản hồi & Đánh giá</h3>
                 <div className="text-4xl font-bold text-yellow-500">4.8 <span className="text-lg text-gray-500 dark:text-gray-300">/ 5 sao</span></div>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">(Dựa trên 1,234 đánh giá)</p>
                 <button className="mt-4 px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700 transition-colors">
                    Xem chi tiết đánh giá
                 </button>
            </div>
        </div>

        {/* TÍNH NĂNG MỚI: Top khách hàng (Thay thế Placeholder) */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Top 5 Khách hàng thân thiết</h3>
            {topCustomers.length === 0 ? (
                 <p className="text-sm text-blue-700 dark:text-blue-300 italic">Chưa có dữ liệu thống kê khách hàng.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                         <thead className="border-b border-blue-300 dark:border-blue-600">
                            <tr>
                                <th className="py-2 text-left text-xs font-medium text-blue-900 dark:text-blue-200 uppercase">Tên Khách hàng</th>
                                <th className="py-2 text-left text-xs font-medium text-blue-900 dark:text-blue-200 uppercase">Email</th>
                                <th className="py-2 text-left text-xs font-medium text-blue-900 dark:text-blue-200 uppercase">Số lần đặt</th>
                                <th className="py-2 text-left text-xs font-medium text-blue-900 dark:text-blue-200 uppercase">Tổng chi tiêu</th>
                            </tr>
                         </thead>
                         <tbody>
                            {topCustomers.map(customer => (
                                <tr key={customer.id} className="border-b border-blue-200 dark:border-blue-700 last:border-b-0">
                                    <td className="py-2 pr-3 text-sm font-medium text-blue-800 dark:text-blue-100">{customer.name}</td>
                                    <td className="py-2 pr-3 text-sm text-blue-700 dark:text-blue-300">{customer.email}</td>
                                    <td className="py-2 pr-3 text-sm text-blue-700 dark:text-blue-300">{customer.count}</td>
                                    <td className="py-2 pr-3 text-sm font-semibold text-blue-800 dark:text-blue-200">{formatCurrency(customer.total_spent)}</td>
                                </tr>
                            ))}
                         </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>

      {/* TÍNH NĂNG MỚI: Hàng chờ phê duyệt */}
      <ProductApprovalQueue />


      {/* Bảng Lịch sử Đặt tour (Đã sửa lỗi & Thêm tìm kiếm) */}
      <div>
         <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Lịch sử Đặt dịch vụ
       </h2>

         {/* TÍNH NĂNG MỚI: Thanh tìm kiếm */}
         <div className="mb-4 relative">
            <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên hoặc email khách hàng..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
         </div>
         {/* KẾT THÚC TÍNH NĂNG MỚI */}
    
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tour/Dịch vụ chính</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dịch vụ thêm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày đặt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tổng giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {/* SỬA LỖI: Dùng filteredBookings và đúng tên alias */}
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {/* SỬA LỖI: Dùng booking.user.full_name */}
                        {booking.user ? booking.user.full_name : "Khách vãng lai"}
                        <span className="block text-xs text-gray-500 dark:text-gray-400">{booking.user ? booking.user.email : ""}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                        {/* SỬA LỖI: Dùng booking.main_tour.name */}
                        {booking.main_tour ? booking.main_tour.name : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-300">
                          {booking.transport_service && <div>Xe: {booking.transport_service.name}</div>}
                          {booking.flight_service && <div>Bay: {booking.flight_service.name}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatDate(booking.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-sky-600 dark:text-sky-400">
                        {formatCurrency(booking.total_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                    {/* KẾT THÚC SỬA LỖI */}
                     {filteredBookings.length === 0 && !loading && (
                        <tr>
                            <td colSpan="6" className="text-center py-10 text-gray-500 italic">
                                {searchTerm ? "Không tìm thấy khách hàng." : "Chưa có đơn đặt nào."}
                            </td>
                        </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
         )}
      </div>
    </div>
  );
}