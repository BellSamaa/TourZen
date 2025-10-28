// ManageCustomersSupabase.jsx
/* NÂNG CẤP LỚN v4: "Luxury & Professional"
  1. (Font) Thêm Google Font "Poppins" cho toàn trang.
  2. (UI) Tiêu đề chính H1 dùng Gradient Text.
  3. (UI) Thẻ Stats có shadow 3D và hiệu ứng hover "nổi" lên.
  4. (UI) Tăng padding "cực lớn" cho bảng để tạo độ "thoáng" và sang trọng.
  5. (UI) Nền trang và nền modal dùng gradient siêu mịn.
  6. (UI) Modal dùng Backdrop Blur (làm mờ nền).
  7. (UI) Phân cấp Typography rõ rệt (Tên to, SĐT nhỏ).
*/

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaSpinner, FaSearch, FaTrash } from "react-icons/fa";
import {
  UserList, CaretLeft, CaretRight, CircleNotch, X, Plus, UsersThree, Crown, Sparkle, Wallet,
  PencilSimple, Check, XCircle, List, Package, Bed, Airplane, Receipt, Cake, Info,
} from "@phosphor-icons/react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const supabase = getSupabase();
const ITEMS_PER_PAGE = 10;
const VIP_THRESHOLD = 20000000;

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

const getCustomerTierStyle = (tier) => {
  switch (tier) {
    case "VIP": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "Thường xuyên": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "Mới": return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300";
  }
};
const CUSTOMER_TIERS = ['Tiêu chuẩn', 'VIP', 'Thường xuyên', 'Mới'];

// --- (NÂNG CẤP) Hiệu ứng Thẻ Stats ---
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const StatCard = ({ title, value, icon, loading }) => (
  <motion.div
    className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-slate-700/50 flex items-center gap-5 transition-all duration-300 hover:shadow-2xl dark:hover:shadow-black/40 hover:-translate-y-1.5"
    variants={cardVariants}
  >
    <div className="p-4 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400">
      {icon}
    </div>
    <div>
      <p className="text-base font-medium text-gray-500 dark:text-gray-400">{title}</p>
      {loading ? (
        <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div>
      ) : (
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      )}
    </div>
  </motion.div>
);

// --- Component Lấy Dữ Liệu Thống Kê (ĐÃ SỬA LỖI ĐẾM VIP) ---
const CustomerStats = () => {
  const [stats, setStats] = useState({ total: 0, vip: 0, new: 0, spend: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // 1. Tổng khách hàng (role 'user')
        const { count: totalCount, error: totalErr } = await supabase
          .from("Users")
          .select("id", { count: "exact", head: true })
          .eq("role", "user");
        if (totalErr) throw totalErr;

        // 2. Tổng chi tiêu (từ Bookings)
        const { data: spendData, error: spendErr } = await supabase
          .from("Bookings")
          .select("total_price")
          .eq("status", "confirmed");
        if (spendErr) throw spendErr;
        const totalSpend = spendData.reduce(
          (sum, row) => sum + (row.total_price || 0),
          0
        );

        // 3. Khách hàng mới (30 ngày qua)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count: newCount, error: newErr } = await supabase
          .from("Users")
          .select("id", { count: "exact", head: true })
          .eq("role", "user")
          .gte("created_at", thirtyDaysAgo.toISOString());
        if (newErr) console.warn("Lỗi fetch new users:", newErr.message);

        // 4. (SỬA LỖI) Đếm khách hàng VIP từ cột "customer_tier"
        const { count: vipCount, error: vipErr } = await supabase
          .from("Users")
          .select("id", { count: "exact", head: true })
          .eq("role", "user")
          .eq("customer_tier", "VIP"); // <<< ĐÂY LÀ THAY ĐỔI QUAN TRỌNG
          
        if (vipErr) {
            console.error("Lỗi đếm VIP:", vipErr);
            throw vipErr;
        }
        
        // 5. Cập nhật State
        setStats({
          total: totalCount || 0,
          vip: vipCount || 0, // <<< Sử dụng số đếm mới
          new: newCount || 0,
          spend: totalSpend,
        });

      } catch (error) { 
        console.error("Lỗi fetch stats:", error);
        toast.error("Không thể tải dữ liệu thống kê.");
      } 
      finally { 
        setLoading(false); 
      }
    };
    fetchStats();
  }, []);

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
    >
      <StatCard title="Tổng khách hàng" value={stats.total} loading={loading} icon={<UsersThree size={28} weight="duotone" />} />
      <StatCard title="Khách hàng VIP" value={stats.vip} loading={loading} icon={<Crown size={28} weight="duotone" />} />
      <StatCard title="Khách hàng mới" value={stats.new} loading={loading} icon={<Sparkle size={28} weight="duotone" />} />
      <StatCard title="Tổng chi tiêu" value={formatStatsNumber(stats.spend)} loading={loading} icon={<Wallet size={28} weight="duotone" />} />
    </motion.div>
  );
};

// --- (NÂNG CẤP) Component Modal Xem Chi Tiết Đơn Hàng ---
const CustomerBookingsModal = ({ customer, onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customer) return;
    // Logic fetch RPC (giữ nguyên)
    const fetchBookings = async () => {
      setLoading(true); setError(null);
      try {
        const { data, error: rpcError } = await supabase.rpc('get_bookings_for_user', { customer_id: customer.id });
        if (rpcError) throw rpcError;
        setBookings(data || []); 
      } catch (err) {
        console.error("Lỗi fetch bookings (RPC):", err);
        setError(err.message.includes("permission denied") ? "Bạn không có quyền xem." : err.message); 
      } finally { setLoading(false); }
    };
    fetchBookings();
  }, [customer]);

  const getProductIcon = (type) => {
    switch (type) {
      case 'tour': return <Package weight="duotone" className="text-blue-500" size={24} />;
      case 'hotel': return <Bed weight="duotone" className="text-green-500" size={24} />;
      case 'flight': return <Airplane weight="duotone" className="text-purple-500" size={24} />;
      default: return <Info weight="duotone" className="text-gray-400" size={24} />;
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="flex justify-between items-center mb-6 pb-6 border-b dark:border-slate-700">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Receipt size={30} className="text-sky-600 dark:text-sky-400" />
            <span>Đơn hàng của: <span className="text-sky-600 dark:text-sky-400">{customer.full_name || customer.email}</span></span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={24} weight="bold" />
          </button>
        </div>
        
        <div className="overflow-y-auto pr-2 -mr-4 simple-scrollbar">
          {loading && (
            <div className="flex justify-center items-center p-20"> <CircleNotch size={40} className="animate-spin text-sky-500" /> </div>
          )}
          {error && <p className="text-center text-red-500 p-20">{error}</p>}
          
          {!loading && !error && bookings.length === 0 && (
            <p className="text-center text-gray-500 p-20 italic text-lg">Khách hàng này chưa có đơn hàng nào.</p>
          )}

          {!loading && !error && bookings.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700/40 sticky top-0">
                <tr>
                  <th className="th-style">Dịch vụ</th>
                  <th className="th-style">Ngày đặt</th>
                  <th className="th-style text-right">Tổng tiền</th>
                  <th className="th-style text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150">
                    <td className="td-style">
                      <div className="flex items-center gap-4">
                        {getProductIcon(b.Products?.product_type)}
                        <div>
                          <div className="font-semibold text-base text-gray-900 dark:text-white">
                            {b.Products?.name || <span className="italic text-gray-400">Dịch vụ đã bị xóa</span>}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {b.Products?.product_type || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="td-style text-sm">
                      {new Date(b.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="td-style text-right font-semibold text-lg whitespace-nowrap">
                      {formatCurrency(b.total_price)}
                    </td>
                    <td className="td-style text-center">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadge(b.status)}`}>
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
    </motion.div>
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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [viewingBookingsCustomer, setViewingBookingsCustomer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // --- Fetch customers (Giữ nguyên logic) ---
  const fetchCustomers = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad) setIsFetchingPage(true);
    setError(null);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      let countQuery = supabase.from("Users").select("id", { count: "exact", head: true }).eq("role", "user");
      let dataQuery = supabase.from("Users").select("*, customer_tier, ngay_sinh").eq("role", "user");

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
        setCustomers([]); setTotalItems(count || 0);
        if (!isInitialLoad && count > 0 && currentPage > 1) { setCurrentPage(1); }
        return;
      }

      const userIds = usersData.map((u) => u.id);
      const { data: bookingsData } = await supabase.from("Bookings").select("user_id, total_price").in("user_id", userIds).eq("status", "confirmed");

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
        customer_tier: user.customer_tier || 'Tiêu chuẩn',
        ngay_sinh: user.ngay_sinh ? user.ngay_sinh.split('T')[0] : '', 
      }));

      setCustomers(combinedData);
      setTotalItems(count || 0);
    } catch (err) {
      console.error("Lỗi fetch khách hàng:", err);
      setError(err.message || "Không thể tải danh sách khách hàng.");
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


  // --- Handlers cho INLINE EDIT (Giữ nguyên logic) ---
  const handleStartEdit = (customer) => {
    setEditingCustomerId(customer.id);
    setEditingData({
      full_name: customer.full_name || '',
      address: customer.address || '',
      phone_number: customer.phone_number || '',
      customer_tier: customer.customer_tier || 'Tiêu chuẩn',
      ngay_sinh: customer.ngay_sinh || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingCustomerId(null); setEditingData({}); setIsSaving(false);
  };

  const handleEditDataChange = (field, value) => {
    setEditingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingCustomerId || isSaving) return;
    if (!editingData.full_name?.trim()) { toast.error("Tên khách hàng không được để trống."); return; }

    setIsSaving(true);
    const updateData = {
        full_name: editingData.full_name.trim(),
        address: editingData.address?.trim() || null,
        phone_number: editingData.phone_number?.trim() || null,
        customer_tier: editingData.customer_tier,
        ngay_sinh: editingData.ngay_sinh || null,
    };

    try {
      const { error } = await supabase.from("Users").update(updateData).eq("id", editingCustomerId);
      if (error) throw error;
      toast.success("Cập nhật khách hàng thành công!");
      handleCancelEdit();
      fetchCustomers();
    } catch (err) {
      console.error("Lỗi lưu:", err);
      toast.error(`Không thể lưu dữ liệu: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Delete Handlers (Giữ nguyên) ---
  const openDeleteConfirm = (c) => {
    setSelectedCustomer(c); setShowDeleteConfirm(true);
  };
  const closeDeleteConfirm = () => {
    setSelectedCustomer(null); setShowDeleteConfirm(false);
  };
  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      const { error } = await supabase.from("Users").delete().eq("id", selectedCustomer.id);
      if (error) throw error;
      toast.success(`Đã xóa hồ sơ "${selectedCustomer.full_name || selectedCustomer.email}"!`);
      if (customers.length === 1 && currentPage > 1) { setCurrentPage(currentPage - 1); } 
      else { fetchCustomers(); }
      closeDeleteConfirm();
    } catch (err) {
      console.error("Lỗi xóa:", err);
      toast.error(`Xóa thất bại: ${err.message}.`);
    }
  };

  const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

  // --- (NÂNG CẤP) Loading Screen ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
        <CircleNotch className="animate-spin text-sky-500" size={52} />
        <p className="text-slate-500 dark:text-slate-400 mt-5 font-semibold text-lg"> Đang tải dữ liệu... </p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-8xl mx-auto p-6 sm:p-8 space-y-8 min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* (NÂNG CẤP) Tiêu đề & Nút Thêm */}
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <motion.h1 
            className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-purple-600 flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <UserList size={36} weight="duotone" />
            Quản lý Khách hàng
          </motion.h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Chỉnh sửa, phân loại và xem lịch sử đơn hàng của khách.
          </p>
        </div>
        <button
          onClick={() => toast('Chức năng "Thêm Khách Hàng" cần quy trình mời (invite) riêng.', { icon: "ℹ️" })}
          className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all duration-300 font-semibold focus:outline-none focus:ring-4 focus:ring-sky-300"
        >
          <Plus size={20} weight="bold" />
          Thêm Khách Hàng
        </button>
      </div>

      {/* Thống kê */}
      <CustomerStats />

      {/* Bảng dữ liệu */}
      <div className="bg-white dark:bg-slate-800 shadow-2xl shadow-gray-200/50 dark:shadow-black/30 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
        {/* Thanh tìm kiếm */}
        <div className="p-5 border-b border-gray-200 dark:border-slate-700">
          <div className="relative flex-grow w-full max-w-lg">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng (tên, email, SĐT...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 text-base rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all duration-300"
            />
          </div>
        </div>

        {/* Bảng */}
        <div className="overflow-x-auto relative">
          {(isFetchingPage || isSaving) && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10">
              <CircleNotch size={36} className="animate-spin text-sky-500" />
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/40">
              <tr>
                <th className="th-style">Họ và tên</th>
                <th className="th-style">Liên hệ</th>
                <th className="th-style">Địa chỉ</th>
                <th className="th-style">Ngày sinh</th>
                <th className="th-style text-center">Đơn</th>
                <th className="th-style text-right">Tổng chi</th>
                <th className="th-style text-center">Loại</th>
                <th className="th-style text-center">Thao tác</th>
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-gray-100 dark:divide-slate-700"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {error && !isFetchingPage && ( <tr><td colSpan="8" className="p-10 text-center text-red-500">{error}</td></tr> )}
              {!error && !loading && !isFetchingPage && customers.length === 0 && ( 
                <tr>
                  <td colSpan="8" className="p-16 text-center text-gray-500">
                    <Archive size={48} className="mx-auto text-gray-400" />
                    <span className="mt-4 text-lg font-medium">{debouncedSearch ? "Không tìm thấy khách hàng." : "Chưa có dữ liệu."}</span>
                  </td>
                </tr> 
              )}
              
              {!error && customers.map((c) => {
                const isEditing = editingCustomerId === c.id;
                const tierStyle = getCustomerTierStyle(isEditing ? editingData.customer_tier : c.customer_tier);
                
                return (
                  <motion.tr
                    key={c.id}
                    className={`transition-colors duration-200 ${isEditing ? 'bg-sky-50 dark:bg-sky-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                    variants={cardVariants}
                    whileHover={{ y: -2 }}
                  >
                    {/* Họ và tên */}
                    <td className="td-style">
                      {isEditing ? (
                        <input type="text" value={editingData.full_name} onChange={(e) => handleEditDataChange('full_name', e.target.value)} className="inline-input-style" />
                      ) : (
                        <span className="font-bold text-lg text-slate-900 dark:text-white">{c.full_name || <span className="italic text-gray-400">...</span>}</span>
                      )}
                    </td>
                    
                    {/* Liên hệ */}
                    <td className="td-style whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{c.email}</span>
                        {isEditing ? (
                          <input type="text" placeholder="Số điện thoại" value={editingData.phone_number} onChange={(e) => handleEditDataChange('phone_number', e.target.value)} className="inline-input-style text-sm mt-1" />
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">{c.phone_number || "..."}</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Địa chỉ */}
                    <td className="td-style max-w-sm">
                      {isEditing ? (
                         <input type="text" placeholder="Địa chỉ" value={editingData.address} onChange={(e) => handleEditDataChange('address', e.target.value)} className="inline-input-style" />
                      ) : (
                        <span className="truncate block text-sm">{c.address || <span className="italic text-gray-400">...</span>}</span>
                      )}
                    </td>

                    {/* Ngày Sinh */}
                    <td className="td-style">
                      {isEditing ? (
                         <input type="date" value={editingData.ngay_sinh} onChange={(e) => handleEditDataChange('ngay_sinh', e.target.value)} className="inline-input-style text-sm" />
                      ) : (
                        <span className="text-sm whitespace-nowrap">
                          {c.ngay_sinh ? new Date(c.ngay_sinh).toLocaleDateString('vi-VN') : <span className="italic text-gray-400">...</span>}
                        </span>
                      )}
                    </td>
                    
                    {/* Số đơn */}
                    <td className="td-style text-center font-bold text-lg text-sky-600 dark:text-sky-400">{c.order_count}</td>
                    
                    {/* Tổng chi tiêu */}
                    <td className="td-style text-right font-bold text-lg text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {formatCurrency(c.total_spend)}
                    </td>
                    
                    {/* Loại (Customer Tier) */}
                    <td className="td-style text-center">
                      {isEditing ? (
                        <select value={editingData.customer_tier} onChange={(e) => handleEditDataChange('customer_tier', e.target.value)} className="inline-select-style">
                          {CUSTOMER_TIERS.map(tier => (<option key={tier} value={tier}>{tier}</option>))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${tierStyle}`}>
                          {c.customer_tier || 'Tiêu chuẩn'}
                        </span>
                      )}
                    </td>
                    
                    {/* Thao tác (Actions) */}
                    <td className="td-style text-center whitespace-nowrap space-x-2">
                      {isEditing ? (
                        <>
                          <button onClick={handleSaveEdit} disabled={isSaving} className="action-button text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30" title="Lưu"><Check size={20} weight="bold" /></button>
                          <button onClick={handleCancelEdit} disabled={isSaving} className="action-button text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/30" title="Hủy"><XCircle size={20} weight="bold" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setViewingBookingsCustomer(c)} disabled={isFetchingPage || editingCustomerId} className="action-button text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30" title="Xem các đơn hàng"><List size={20} weight="bold" /></button>
                          <button onClick={() => handleStartEdit(c)} disabled={isFetchingPage || editingCustomerId} className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa thông tin"><PencilSimple size={20} weight="bold" /></button>
                          <button onClick={() => openDeleteConfirm(c)} disabled={isFetchingPage || editingCustomerId} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa hồ sơ"><FaTrash size={18} /></button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* --- Pagination UI --- */}
      {!loading && totalItems > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-base text-gray-600 dark:text-gray-400">
          <div> Hiển thị <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> trên <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span> khách hàng </div>
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
      
      <AnimatePresence>
        {showDeleteConfirm && selectedCustomer && (
          <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div 
              className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center border border-gray-200 dark:border-slate-700"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            >
              <h4 className="text-xl font-bold text-red-600 dark:text-red-500 mb-4"> Xác nhận xóa hồ sơ </h4>
              <p className="mb-8 text-base text-gray-700 dark:text-gray-300">
                Bạn có chắc muốn xóa hồ sơ của{" "} <b className="text-gray-900 dark:text-white">{selectedCustomer.full_name || selectedCustomer.email}</b>?
                <br/>
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">(Hành động này không xóa tài khoản đăng nhập.)</span>
              </p>
              <div className="flex justify-center gap-4">
                <button className="modal-button-secondary" onClick={closeDeleteConfirm}> Hủy </button>
                <button className="modal-button-danger" onClick={handleDelete}> Xóa hồ sơ </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* (MỚI) Thêm Google Font "Poppins" */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
        :root {
          --font-poppins: 'Poppins', sans-serif;
        }
        body, .font-sans {
          font-family: var(--font-poppins), sans-serif;
        }
      `}</style>

      {/* --- CSS (NÂNG CẤP TOÀN DIỆN V4) --- */}
      <style jsx>{`
        .th-style { 
          @apply px-6 py-5 text-left text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider; 
        }
        .td-style { 
          @apply px-6 py-6 text-sm text-gray-600 dark:text-gray-300 align-middle; /* Tăng padding */
        }
        .action-button { 
          @apply p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95; 
        }
        .pagination-arrow { 
          @apply p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; 
        }
        .pagination-number { 
          @apply w-10 h-10 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-base; 
        }
        .pagination-active { 
          @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; 
        }
        .pagination-dots { 
          @apply px-2 py-1 text-gray-500 dark:text-gray-400; 
        }
        
        /* (NÂNG CẤP) CSS cho Inline Editing */
        .inline-input-style {
          @apply p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg w-full bg-white dark:bg-slate-700 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition duration-200 text-sm;
        }
        .inline-select-style {
          @apply p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg w-full bg-white dark:bg-slate-700 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition duration-200 text-xs;
        }

        /* (NÂNG CẤP) Modal buttons */
        .modal-button-secondary { 
          @apply px-6 py-3 bg-neutral-200 dark:bg-neutral-700 rounded-lg font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-600 text-sm transition-all duration-200; 
        }
        .modal-button-danger { 
          @apply px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 text-sm transition-all duration-200 shadow-lg shadow-red-500/30; 
        }

        /* (NÂNG CẤP) Scrollbar cho Modal */
        .simple-scrollbar::-webkit-scrollbar { width: 8px; }
        .simple-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .simple-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db; /* gray-300 */
          border-radius: 10px;
        }
        .dark .simple-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563; /* dark:gray-600 */
        }
      `}</style>
    </motion.div>
  );
}