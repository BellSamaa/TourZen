// ManageCustomersSupabase.jsx
/* NÂNG CẤP LỚN:
  1. Giao diện + Hiệu ứng (Framer Motion).
  2. Chỉnh sửa Inline (Click-to-Edit) thay vì Form Modal.
  3. Modal xem chi tiết đơn hàng (Join Bookings + Products).
  4. Cột "Loại" (customer_tier) có thể chỉnh sửa được.
*/

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaSpinner,
  FaSearch,
  FaTrash,
  FaUsers,
  FaDollarSign,
} from "react-icons/fa";
import {
  UserList,
  CaretLeft,
  CaretRight,
  CircleNotch,
  X,
  Plus,
  UsersThree,
  Crown,
  Sparkle,
  Wallet,
  PencilSimple, // Sửa
  Check,        // Lưu
  XCircle,      // Hủy
  List,         // Xem đơn
  Package,      // Dịch vụ
  Calendar,     // Ngày
  Receipt,      // Hóa đơn
} from "@phosphor-icons/react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"; // <<< THÊM Framer Motion

const supabase = getSupabase();
const ITEMS_PER_PAGE = 10;
const VIP_THRESHOLD = 20000000; // Vẫn dùng để tính Stats

// --- Hooks & Helpers (Giữ nguyên) ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
};

const getPaginationWindow = (currentPage, totalPages, width = 2) => {
  if (totalPages <= 1) return [];
  if (totalPages <= 5 + width * 2) { return Array.from({ length: totalPages }, (_, i) => i + 1); }
  const pages = new Set([1]);
  for (let i = Math.max(2, currentPage - width); i <= Math.min(totalPages - 1, currentPage + width); i++) { pages.add(i); }
  pages.add(totalPages);
  const sortedPages = [...pages].sort((a, b) => a - b);
  const finalPages = []; let lastPage = 0;
  for (const page of sortedPages) { if (lastPage !== 0 && page - lastPage > 1) { finalPages.push("..."); } finalPages.push(page); lastPage = page; }
  return finalPages;
};

const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

const formatStatsNumber = (num) => {
  if (num >= 1_000_000_000) { return (num / 1_000_000_000).toFixed(1) + " tỷ"; }
  if (num >= 1_000_000) { return (num / 1_000_000).toFixed(1) + " triệu"; }
  if (num >= 1_000) { return (num / 1_000).toFixed(1) + " k"; }
  return num;
};

// --- (ĐÃ SỬA) Badge style cho CỘT MỚI customer_tier ---
const getCustomerTierStyle = (tier) => {
  switch (tier) {
    case "VIP":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "Thường xuyên":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    case "Mới":
      return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300";
    default: // 'Tiêu chuẩn' hoặc null
      return "bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-300";
  }
};
// (MỚI) Các loại tier để chọn
const CUSTOMER_TIERS = ['Tiêu chuẩn', 'VIP', 'Thường xuyên', 'Mới'];

// --- Component Thẻ Thống kê (Giữ nguyên) ---
const StatCard = ({ title, value, icon, loading }) => (
  <motion.div
    className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="p-3 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      {loading ? (
        <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div>
      ) : (
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      )}
    </div>
  </motion.div>
);

// --- Component Lấy Dữ Liệu Thống Kê (Giữ nguyên) ---
const CustomerStats = () => {
  const [stats, setStats] = useState({ total: 0, vip: 0, new: 0, spend: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: totalCount, error: totalErr } = await supabase.from("Users").select("id", { count: "exact", head: true }).eq("role", "user");
        if (totalErr) throw totalErr;
        const { data: spendData, error: spendErr } = await supabase.from("Bookings").select("total_price").eq("status", "confirmed");
        if (spendErr) throw spendErr;
        const totalSpend = spendData.reduce((sum, row) => sum + (row.total_price || 0), 0);
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count: newCount, error: newErr } = await supabase.from("Users").select("id", { count: "exact", head: true }).eq("role", "user").gte("created_at", thirtyDaysAgo.toISOString());
        if (newErr) console.warn("Lỗi fetch new users:", newErr.message);
        const { data: allBookings, error: bookingsErr } = await supabase.from("Bookings").select("user_id, total_price").eq("status", "confirmed");
        if (bookingsErr) throw bookingsErr;
        const spendByUser = allBookings.reduce((acc, b) => { acc[b.user_id] = (acc[b.user_id] || 0) + (b.total_price || 0); return acc; }, {});
        const vipCount = Object.values(spendByUser).filter((spend) => spend >= VIP_THRESHOLD).length;

        setStats({
          total: totalCount || 0,
          vip: vipCount,
          new: newCount || 0,
          spend: totalSpend,
        });
      } catch (error) {
        console.error("Lỗi fetch stats:", error);
        toast.error("Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatCard title="Tổng khách hàng" value={stats.total} loading={loading} icon={<UsersThree size={22} weight="duotone" />} />
      <StatCard title="Khách hàng VIP" value={stats.vip} loading={loading} icon={<Crown size={22} weight="duotone" />} />
      <StatCard title="Khách hàng mới" value={stats.new} loading={loading} icon={<Sparkle size={22} weight="duotone" />} />
      <StatCard title="Tổng chi tiêu" value={formatStatsNumber(stats.spend)} loading={loading} icon={<Wallet size={22} weight="duotone" />} />
    </div>
  );
};

// --- (MỚI) Component Modal Xem Chi Tiết Đơn Hàng ---
const CustomerBookingsModal = ({ customer, onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customer) return;
    
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Dùng JOIN để lấy tên sản phẩm từ bảng "Products"
        const { data, error: fetchError } = await supabase
          .from("Bookings")
          .select(`
            id,
            created_at,
            total_price,
            status,
            Products (
              name,
              product_type
            )
          `)
          .eq("user_id", customer.id)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        setBookings(data || []);
      } catch (err) {
        console.error("Lỗi fetch bookings:", err);
        setError("Không thể tải danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [customer]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <motion.div
        className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Đơn hàng của: <span className="text-sky-600">{customer.full_name || customer.email}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto space-y-3 pr-2">
          {loading && (
            <div className="flex justify-center items-center p-12">
              <CircleNotch size={32} className="animate-spin text-sky-500" />
            </div>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}
          
          {!loading && !error && bookings.length === 0 && (
            <p className="text-center text-gray-500 p-12 italic">Khách hàng này chưa có đơn hàng nào.</p>
          )}

          {!loading && !error && bookings.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700/40">
                <tr>
                  <th className="th-style">Dịch vụ</th>
                  <th className="th-style">Ngày đặt</th>
                  <th className="th-style text-right">Tổng tiền</th>
                  <th className="th-style text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td className="td-style">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {b.Products?.name || <span className="italic text-gray-400">Dịch vụ đã bị xóa</span>}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {b.Products?.product_type || 'N/A'}
                      </div>
                    </td>
                    <td className="td-style text-xs">
                      {new Date(b.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="td-style text-right font-medium whitespace-nowrap">
                      {formatCurrency(b.total_price)}
                    </td>
                    <td className="td-style text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
};


// --- Component Chính ---
export default function ManageCustomersSupabase() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  // (MỚI) State cho Inline Editing
  const [editingCustomerId, setEditingCustomerId] = useState(null); // ID của khách đang sửa
  const [editingData, setEditingData] = useState({}); // Dữ liệu tạm thời khi sửa
  const [isSaving, setIsSaving] = useState(false);

  // (MỚI) State cho Modal Đơn hàng
  const [viewingBookingsCustomer, setViewingBookingsCustomer] = useState(null);

  // (MỚI) State cho Xóa
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);


  // --- (ĐÃ SỬA) Fetch customers (Thêm cột customer_tier) ---
  const fetchCustomers = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad) setIsFetchingPage(true);
    setError(null);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      // 1. Lấy Count
      let countQuery = supabase.from("Users").select("id", { count: "exact", head: true }).eq("role", "user");
      // 2. Lấy Data (thêm customer_tier)
      let dataQuery = supabase.from("Users").select("*, customer_tier").eq("role", "user");

      if (debouncedSearch.trim() !== "") {
        const searchTerm = `%${debouncedSearch.trim()}%`;
        const searchQuery = `full_name.ilike.${searchTerm},email.ilike.${searchTerm},address.ilike.${searchTerm},phone_number.ilike.${searchTerm}`;
        countQuery = countQuery.or(searchQuery);
        dataQuery = dataQuery.or(searchQuery);
      }

      dataQuery = dataQuery.order("full_name", { ascending: true }).range(from, to);

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      const { data: usersData, error: usersError } = await dataQuery;
      if (usersError) throw usersError;

      if (!usersData || usersData.length === 0) {
        setCustomers([]);
        setTotalItems(count || 0);
        if (!isInitialLoad && count > 0 && currentPage > 1) { setCurrentPage(1); }
        return;
      }

      // 3. Lấy stats (Số đơn, Tổng chi)
      const userIds = usersData.map((u) => u.id);
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("Bookings")
        .select("user_id, total_price")
        .in("user_id", userIds)
        .eq("status", "confirmed");
      if (bookingsError) console.warn("Lỗi fetch bookings stats:", bookingsError.message);

      // 4. Gộp dữ liệu
      const statsMap = (bookingsData || []).reduce((acc, booking) => {
        const userId = booking.user_id;
        if (!acc[userId]) { acc[userId] = { order_count: 0, total_spend: 0 }; }
        acc[userId].order_count += 1;
        acc[userId].total_spend += booking.total_price || 0;
        return acc;
      }, {});

      const combinedData = usersData.map((user) => ({
        ...user,
        order_count: statsMap[user.id]?.order_count || 0,
        total_spend: statsMap[user.id]?.total_spend || 0,
        customer_tier: user.customer_tier || 'Tiêu chuẩn', // Đảm bảo có giá trị
      }));

      setCustomers(combinedData);
      setTotalItems(count || 0);
    } catch (err) {
      console.error("Lỗi fetch khách hàng:", err);
      const errorMsg = err.message || "Không thể tải danh sách khách hàng.";
      setError(errorMsg);
      toast.error(`Lỗi tải danh sách: ${errorMsg}`);
    } finally {
      if (isInitialLoad) setLoading(false);
      setIsFetchingPage(false);
    }
  }, [currentPage, debouncedSearch]);

  // --- Triggers Fetch & Reset (Giữ nguyên) ---
  useEffect(() => {
    const isInitial = customers.length === 0 && loading;
    fetchCustomers(isInitial);
  }, [fetchCustomers, customers.length, loading]);

  useEffect(() => {
    if (currentPage !== 1) { setCurrentPage(1); }
  }, [debouncedSearch]);


  // --- (MỚI) Handlers cho INLINE EDIT ---
  const handleStartEdit = (customer) => {
    setEditingCustomerId(customer.id);
    // Lưu dữ liệu gốc vào state chỉnh sửa
    setEditingData({
      full_name: customer.full_name || '',
      address: customer.address || '',
      phone_number: customer.phone_number || '',
      customer_tier: customer.customer_tier || 'Tiêu chuẩn',
    });
  };

  const handleCancelEdit = () => {
    setEditingCustomerId(null);
    setEditingData({});
    setIsSaving(false);
  };

  const handleEditDataChange = (field, value) => {
    setEditingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingCustomerId || isSaving) return;
    
    // Validation
    if (!editingData.full_name?.trim()) {
      toast.error("Tên khách hàng không được để trống.");
      return;
    }

    setIsSaving(true);
    const updateData = {
        full_name: editingData.full_name.trim(),
        address: editingData.address?.trim() || null,
        phone_number: editingData.phone_number?.trim() || null,
        customer_tier: editingData.customer_tier,
    };

    try {
      const { error } = await supabase
        .from("Users")
        .update(updateData)
        .eq("id", editingCustomerId);
      
      if (error) throw error;
      
      toast.success("Cập nhật khách hàng thành công!");
      handleCancelEdit(); // Tắt chế độ edit
      fetchCustomers();   // Tải lại dữ liệu
    } catch (err) {
      console.error("Lỗi lưu:", err);
      toast.error(`Không thể lưu dữ liệu: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };


  // --- Delete Handlers (Giữ nguyên, chỉ đổi tên biến) ---
  const openDeleteConfirm = (c) => {
    setSelectedCustomer(c);
    setShowDeleteConfirm(true);
  };
  const closeDeleteConfirm = () => {
    setSelectedCustomer(null);
    setShowDeleteConfirm(false);
  };
  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      const { error } = await supabase.from("Users").delete().eq("id", selectedCustomer.id);
      if (error) throw error;
      toast.success(`Đã xóa hồ sơ "${selectedCustomer.full_name || selectedCustomer.email}"!`);
      if (customers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchCustomers();
      }
      closeDeleteConfirm();
    } catch (err) {
      console.error("Lỗi xóa:", err);
      toast.error(`Xóa thất bại: ${err.message}.`);
    }
  };

  // --- Pagination Window (Giữ nguyên) ---
  const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

  // --- Loading ban đầu (Giữ nguyên) ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-24 text-center">
        <FaSpinner className="animate-spin text-sky-500" size={40} />
        <p className="text-slate-500 mt-3 font-medium"> Đang tải danh sách khách hàng... </p>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-50/50 dark:bg-slate-900 dark:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Tiêu đề & Nút Thêm */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            Quản lý Khách hàng
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý thông tin khách hàng
          </p>
        </div>
        <button
          onClick={() => toast('Chức năng "Thêm Khách Hàng" cần quy trình mời (invite) riêng.', { icon: "ℹ️" })}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg shadow-md hover:bg-sky-700 transition font-semibold"
        >
          <Plus size={18} weight="bold" />
          Thêm Khách Hàng
        </button>
      </div>

      {/* Thống kê */}
      <CustomerStats />

      {/* Bảng dữ liệu */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
        {/* Thanh tìm kiếm */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="relative flex-grow w-full max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition"
            />
          </div>
        </div>

        {/* Bảng */}
        <div className="overflow-x-auto relative">
          {(isFetchingPage || isSaving) && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10">
              <CircleNotch size={32} className="animate-spin text-sky-500" />
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/40">
              <tr>
                <th className="th-style">Họ và tên</th>
                <th className="th-style">Liên hệ</th>
                <th className="th-style">Địa chỉ</th>
                <th className="th-style text-center">Số đơn</th>
                <th className="th-style text-right">Tổng chi tiêu</th>
                <th className="th-style text-center">Loại</th>
                <th className="th-style text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {error && !isFetchingPage && ( <tr><td colSpan="7" className="p-8 text-center text-red-500">{error}</td></tr> )}
              {!error && !loading && !isFetchingPage && customers.length === 0 && ( <tr><td colSpan="7" className="p-8 text-center text-gray-500 italic">{debouncedSearch ? "Không tìm thấy khách hàng." : "Chưa có dữ liệu."}</td></tr> )}
              
              <AnimatePresence>
                {!error && customers.map((c) => {
                  const isEditing = editingCustomerId === c.id;
                  const tierStyle = getCustomerTierStyle(isEditing ? editingData.customer_tier : c.customer_tier);
                  
                  return (
                    <motion.tr
                      key={c.id}
                      className={isEditing ? 'bg-sky-50 dark:bg-sky-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors'}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Họ và tên */}
                      <td className="td-style">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingData.full_name}
                            onChange={(e) => handleEditDataChange('full_name', e.target.value)}
                            className="inline-input-style"
                          />
                        ) : (
                          <span className="font-medium text-gray-900 dark:text-white">
                            {c.full_name || <span className="italic text-gray-400">Chưa cập nhật</span>}
                          </span>
                        )}
                      </td>
                      
                      {/* Liên hệ */}
                      <td className="td-style whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-800 dark:text-gray-200">{c.email}</span>
                          {isEditing ? (
                            <input
                              type="text"
                              placeholder="Số điện thoại"
                              value={editingData.phone_number}
                              onChange={(e) => handleEditDataChange('phone_number', e.target.value)}
                              className="inline-input-style text-xs mt-1"
                            />
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {c.phone_number || "Chưa có SĐT"}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Địa chỉ */}
                      <td className="td-style max-w-xs">
                        {isEditing ? (
                           <input
                            type="text"
                            placeholder="Địa chỉ"
                            value={editingData.address}
                            onChange={(e) => handleEditDataChange('address', e.target.value)}
                            className="inline-input-style"
                          />
                        ) : (
                          <span className="truncate block">
                            {c.address || <span className="italic text-gray-400">Chưa có</span>}
                          </span>
                        )}
                      </td>
                      
                      {/* Số đơn */}
                      <td className="td-style text-center">{c.order_count}</td>
                      
                      {/* Tổng chi tiêu */}
                      <td className="td-style text-right font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {formatCurrency(c.total_spend)}
                      </td>
                      
                      {/* Loại (Customer Tier) */}
                      <td className="td-style text-center">
                        {isEditing ? (
                          <select
                            value={editingData.customer_tier}
                            onChange={(e) => handleEditDataChange('customer_tier', e.target.value)}
                            className="inline-select-style"
                          >
                            {CUSTOMER_TIERS.map(tier => (
                              <option key={tier} value={tier}>{tier}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${tierStyle}`}>
                            {c.customer_tier || 'Tiêu chuẩn'}
                          </span>
                        )}
                      </td>
                      
                      {/* Thao tác (Actions) */}
                      <td className="td-style text-center whitespace-nowrap space-x-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                              className="action-button text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30"
                              title="Lưu"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="action-button text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/30"
                              title="Hủy"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setViewingBookingsCustomer(c)}
                              disabled={isFetchingPage || editingCustomerId}
                              className="action-button text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                              title="Xem các đơn hàng"
                            >
                              <List size={16} />
                            </button>
                            <button
                              onClick={() => handleStartEdit(c)}
                              disabled={isFetchingPage || editingCustomerId}
                              className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              title="Sửa thông tin"
                            >
                              <PencilSimple size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(c)}
                              disabled={isFetchingPage || editingCustomerId}
                              className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                              title="Xóa hồ sơ"
                            >
                              <FaTrash size={14} />
                            </button>
                          </>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Pagination UI --- */}
      {!loading && totalItems > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          <div> Hiển thị <span className="font-semibold dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> / <span className="font-semibold dark:text-white">{totalItems}</span> khách hàng </div>
          <div className="flex items-center gap-1 mt-3 sm:mt-0">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1 || isFetchingPage} className="pagination-arrow" aria-label="Trang trước"><CaretLeft weight="bold" /></button>
            {paginationWindow.map((pageNumber, idx) => pageNumber === "..." ? ( <span key={`dots-${idx}`} className="pagination-dots">...</span> ) : (
              <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} disabled={isFetchingPage} className={`pagination-number ${ currentPage === pageNumber ? "pagination-active" : "" }`}>{pageNumber}</button>
            ))}
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || isFetchingPage} className="pagination-arrow" aria-label="Trang sau"><CaretRight weight="bold" /></button>
          </div>
        </div>
      )}

      {/* --- Modals --- */}
      <AnimatePresence>
        {viewingBookingsCustomer && (
          <CustomerBookingsModal
            customer={viewingBookingsCustomer}
            onClose={() => setViewingBookingsCustomer(null)}
          />
        )}
      </AnimatePresence>
      
      {showDeleteConfirm && selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
          <motion.div 
            className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-sm text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h4 className="text-lg font-semibold text-red-600 mb-3"> Xác nhận xóa hồ sơ </h4>
            <p className="mb-4">
              Bạn có chắc muốn xóa hồ sơ của{" "}
              <b>{selectedCustomer.full_name || selectedCustomer.email}</b>?
              <br/>
              <span className="text-sm text-orange-600 dark:text-orange-400">(Hành động này không xóa tài khoản đăng nhập.)</span>
            </p>
            <div className="flex justify-center gap-3">
              <button className="modal-button-secondary" onClick={closeDeleteConfirm}> Hủy </button>
              <button className="modal-button-danger" onClick={handleDelete}> Xóa hồ sơ </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- CSS --- */}
      <style jsx>{`
        .th-style { @apply px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider; }
        .td-style { @apply px-4 py-3 text-sm text-gray-600 dark:text-gray-300; }
        .action-button { @apply p-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
        .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
        .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
        .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
        .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
        
        /* (MỚI) CSS cho Inline Editing */
        .inline-input-style {
          @apply p-1 border border-sky-300 dark:border-sky-700 rounded-md w-full bg-white dark:bg-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-sm;
        }
        .inline-select-style {
          @apply p-1 border border-sky-300 dark:border-sky-700 rounded-md w-full bg-white dark:bg-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-xs;
        }

        /* Modal buttons (cho modal Xóa) */
        .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm transition-colors; }
        .modal-button-danger { @apply px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm transition-colors; }
      `}</style>
    </motion.div>
  );
}