// ManageCustomersSupabase.jsx
/* NÂNG CẤP LỚN v2:
  1. (FIX) Dùng RPC để xem đơn hàng (vượt RLS).
  2. (UI) Thêm hiệu ứng stagger (xuất hiện lần lượt) cho Stats và Bảng.
  3. (UI) Thêm cột "Ngày Sinh" (ngay_sinh) vào inline editing.
  4. (UI) Thêm icons cho loại dịch vụ, trạng thái, tinh chỉnh giao diện.
*/

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaSpinner, FaSearch, FaTrash } from "react-icons/fa";
import {
  UserList, CaretLeft, CaretRight, CircleNotch, X, Plus, UsersThree, Crown, Sparkle, Wallet,
  PencilSimple, Check, XCircle, List, Package, Bed, Airplane, Receipt, Cake, Info,
} from "@phosphor-icons/react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"; // <<< Đã có Framer Motion

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

// --- Badge style cho CỘT MỚI customer_tier ---
const getCustomerTierStyle = (tier) => {
  switch (tier) {
    case "VIP": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "Thường xuyên": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    case "Mới": return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300";
    default: return "bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-300";
  }
};
const CUSTOMER_TIERS = ['Tiêu chuẩn', 'VIP', 'Thường xuyên', 'Mới'];

// --- (NÂNG CẤP) Hiệu ứng cho Thẻ Stats ---
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const StatCard = ({ title, value, icon, loading }) => (
  <motion.div
    className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700/50 flex items-center gap-4"
    variants={cardVariants}
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

// --- Component Lấy Dữ Liệu Thống Kê ---
const CustomerStats = () => {
  const [stats, setStats] = useState({ total: 0, vip: 0, new: 0, spend: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Logic fetch stats (giữ nguyên)
    const fetchStats = async () => {
      try {
        const { count: totalCount } = await supabase.from("Users").select("id", { count: "exact", head: true }).eq("role", "user");
        const { data: spendData } = await supabase.from("Bookings").select("total_price").eq("status", "confirmed");
        const totalSpend = spendData.reduce((sum, row) => sum + (row.total_price || 0), 0);
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count: newCount } = await supabase.from("Users").select("id", { count: "exact", head: true }).eq("role", "user").gte("created_at", thirtyDaysAgo.toISOString());
        const { data: allBookings } = await supabase.from("Bookings").select("user_id, total_price").eq("status", "confirmed");
        const spendByUser = allBookings.reduce((acc, b) => { acc[b.user_id] = (acc[b.user_id] || 0) + (b.total_price || 0); return acc; }, {});
        const vipCount = Object.values(spendByUser).filter((spend) => spend >= VIP_THRESHOLD).length;
        setStats({ total: totalCount || 0, vip: vipCount, new: newCount || 0, spend: totalSpend });
      } catch (error) { console.error("Lỗi fetch stats:", error); } 
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  return (
    <motion.div // (NÂNG CẤP) Thêm staggerChildren
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } }
      }}
    >
      <StatCard title="Tổng khách hàng" value={stats.total} loading={loading} icon={<UsersThree size={22} weight="duotone" />} />
      <StatCard title="Khách hàng VIP" value={stats.vip} loading={loading} icon={<Crown size={22} weight="duotone" />} />
      <StatCard title="Khách hàng mới" value={stats.new} loading={loading} icon={<Sparkle size={22} weight="duotone" />} />
      <StatCard title="Tổng chi tiêu" value={formatStatsNumber(stats.spend)} loading={loading} icon={<Wallet size={22} weight="duotone" />} />
    </motion.div>
  );
};

// --- (SỬA LỖI) Component Modal Xem Chi Tiết Đơn Hàng (Dùng RPC) ---
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
        // (FIX) Dùng RPC (Remote Procedure Call) để bypass RLS
        const { data, error: rpcError } = await supabase.rpc(
          'get_bookings_for_user', 
          { customer_id: customer.id } // Tên tham số phải khớp với SQL
        );

        if (rpcError) throw rpcError;
        
        // Dữ liệu RPC trả về là một JSON, có thể là null nếu không có đơn
        setBookings(data || []); 
      } catch (err) {
        console.error("Lỗi fetch bookings (RPC):", err);
        // Lỗi "Chỉ có admin..." từ SQL sẽ bị bắt ở đây
        setError(err.message.includes("permission denied") ? "Bạn không có quyền xem." : err.message); 
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [customer]);

  // (NÂNG CẤP) Icon cho loại dịch vụ
  const getProductIcon = (type) => {
    switch (type) {
      case 'tour': return <Package weight="duotone" className="text-blue-500" />;
      case 'hotel': return <Bed weight="duotone" className="text-green-500" />;
      case 'flight': return <Airplane weight="duotone" className="text-purple-500" />;
      default: return <Info weight="duotone" className="text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-300';
    }
  };

  return (
    // (NÂNG CẤP) Thêm hiệu ứng cho backdrop
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-slate-700">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Receipt size={24} className="text-sky-600" />
            Đơn hàng của: <span className="text-sky-600">{customer.full_name || customer.email}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} weight="bold" />
          </button>
        </div>
        
        <div className="overflow-y-auto space-y-3 pr-2 -mr-2">
          {loading && (
            <div className="flex justify-center items-center p-12"> <CircleNotch size={32} className="animate-spin text-sky-500" /> </div>
          )}
          {error && <p className="text-center text-red-500 p-12">{error}</p>}
          
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
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="td-style">
                      <div className="flex items-center gap-3">
                        {getProductIcon(b.Products?.product_type)}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {b.Products?.name || <span className="italic text-gray-400">Dịch vụ đã bị xóa</span>}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {b.Products?.product_type || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="td-style text-xs">
                      {new Date(b.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="td-style text-right font-medium whitespace-nowrap">
                      {formatCurrency(b.total_price)}
                    </td>
                    <td className="td-style text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(b.status)}`}>
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

  // --- (NÂNG CẤP) Fetch customers (Thêm cột ngay_sinh) ---
  const fetchCustomers = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad) setIsFetchingPage(true);
    setError(null);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      let countQuery = supabase.from("Users").select("id", { count: "exact", head: true }).eq("role", "user");
      // Lấy thêm 'ngay_sinh'
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
        // Đảm bảo ngay_sinh là định dạng YYYY-MM-DD cho input type="date"
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


  // --- (NÂNG CẤP) Handlers cho INLINE EDIT (Thêm ngay_sinh) ---
  const handleStartEdit = (customer) => {
    setEditingCustomerId(customer.id);
    setEditingData({
      full_name: customer.full_name || '',
      address: customer.address || '',
      phone_number: customer.phone_number || '',
      customer_tier: customer.customer_tier || 'Tiêu chuẩn',
      ngay_sinh: customer.ngay_sinh || '', // đã ở định dạng YYYY-MM-DD
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
        ngay_sinh: editingData.ngay_sinh || null, // Lưu ngày sinh
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50/50 dark:bg-slate-900">
        <CircleNotch className="animate-spin text-sky-500" size={48} />
        <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium"> Đang tải dữ liệu... </p>
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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <UserList size={32} weight="duotone" className="text-sky-600" />
            Quản lý Khách hàng
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
            Chỉnh sửa thông tin, phân loại và xem lịch sử đơn hàng.
          </p>
        </div>
        <button
          onClick={() => toast('Chức năng "Thêm Khách Hàng" cần quy trình mời (invite) riêng.', { icon: "ℹ️" })}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg shadow-md hover:bg-sky-700 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Plus size={18} weight="bold" />
          Thêm Khách Hàng
        </button>
      </div>

      {/* Thống kê */}
      <CustomerStats />

      {/* Bảng dữ liệu */}
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
        {/* Thanh tìm kiếm */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="relative flex-grow w-full max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng (tên, email, SĐT...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition"
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
                <th className="th-style">Ngày sinh</th>
                <th className="th-style text-center">Đơn</th>
                <th className="th-style text-right">Tổng chi</th>
                <th className="th-style text-center">Loại</th>
                <th className="th-style text-center">Thao tác</th>
              </tr>
            </thead>
            <motion.tbody // (NÂNG CẤP) Thêm staggerChildren
              className="divide-y divide-gray-100 dark:divide-slate-700"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
            >
              {error && !isFetchingPage && ( <tr><td colSpan="8" className="p-8 text-center text-red-500">{error}</td></tr> )}
              {!error && !loading && !isFetchingPage && customers.length === 0 && ( <tr><td colSpan="8" className="p-8 text-center text-gray-500 italic">{debouncedSearch ? "Không tìm thấy khách hàng." : "Chưa có dữ liệu."}</td></tr> )}
              
              {!error && customers.map((c) => {
                const isEditing = editingCustomerId === c.id;
                const tierStyle = getCustomerTierStyle(isEditing ? editingData.customer_tier : c.customer_tier);
                
                return (
                  <motion.tr
                    key={c.id}
                    className={isEditing ? 'bg-sky-50 dark:bg-sky-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors'}
                    layout
                    variants={cardVariants} // Dùng chung variants với StatCard
                  >
                    {/* Họ và tên */}
                    <td className="td-style">
                      {isEditing ? (
                        <input type="text" value={editingData.full_name} onChange={(e) => handleEditDataChange('full_name', e.target.value)} className="inline-input-style" />
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-white">{c.full_name || <span className="italic text-gray-400">...</span>}</span>
                      )}
                    </td>
                    
                    {/* Liên hệ */}
                    <td className="td-style whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-800 dark:text-gray-200">{c.email}</span>
                        {isEditing ? (
                          <input type="text" placeholder="Số điện thoại" value={editingData.phone_number} onChange={(e) => handleEditDataChange('phone_number', e.target.value)} className="inline-input-style text-xs mt-1" />
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{c.phone_number || "..."}</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Địa chỉ */}
                    <td className="td-style max-w-xs">
                      {isEditing ? (
                         <input type="text" placeholder="Địa chỉ" value={editingData.address} onChange={(e) => handleEditDataChange('address', e.target.value)} className="inline-input-style" />
                      ) : (
                        <span className="truncate block">{c.address || <span className="italic text-gray-400">...</span>}</span>
                      )}
                    </td>

                    {/* (MỚI) Ngày Sinh */}
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
                    <td className="td-style text-center font-medium">{c.order_count}</td>
                    
                    {/* Tổng chi tiêu */}
                    <td className="td-style text-right font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {formatCurrency(c.total_spend)}
                    </td>
                    
                    {/* Loại (Customer Tier) */}
                    <td className="td-style text-center">
                      {isEditing ? (
                        <select value={editingData.customer_tier} onChange={(e) => handleEditDataChange('customer_tier', e.target.value)} className="inline-select-style">
                          {CUSTOMER_TIERS.map(tier => (<option key={tier} value={tier}>{tier}</option>))}
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
                          <button onClick={handleSaveEdit} disabled={isSaving} className="action-button text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30" title="Lưu"><Check size={18} weight="bold" /></button>
                          <button onClick={handleCancelEdit} disabled={isSaving} className="action-button text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/30" title="Hủy"><XCircle size={18} weight="bold" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setViewingBookingsCustomer(c)} disabled={isFetchingPage || editingCustomerId} className="action-button text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30" title="Xem các đơn hàng"><List size={18} weight="bold" /></button>
                          <button onClick={() => handleStartEdit(c)} disabled={isFetchingPage || editingCustomerId} className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa thông tin"><PencilSimple size={18} weight="bold" /></button>
                          <button onClick={() => openDeleteConfirm(c)} disabled={isFetchingPage || editingCustomerId} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa hồ sơ"><FaTrash size={16} /></button>
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
      
      <AnimatePresence>
        {showDeleteConfirm && selectedCustomer && (
          <motion.div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div 
              className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-sm text-center"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            >
              <h4 className="text-lg font-semibold text-red-600 mb-3"> Xác nhận xóa hồ sơ </h4>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Bạn có chắc muốn xóa hồ sơ của{" "} <b>{selectedCustomer.full_name || selectedCustomer.email}</b>?
                <br/>
                <span className="text-sm text-orange-600 dark:text-orange-400">(Hành động này không xóa tài khoản đăng nhập.)</span>
              </p>
              <div className="flex justify-center gap-3">
                <button className="modal-button-secondary" onClick={closeDeleteConfirm}> Hủy </button>
                <button className="modal-button-danger" onClick={handleDelete}> Xóa hồ sơ </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CSS --- */}
      <style jsx>{`
        .th-style { @apply px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider; }
        .td-style { @apply px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300; }
        .action-button { @apply p-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
        .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
        .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
        .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
        .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
        
        .inline-input-style {
          @apply p-1.5 border border-sky-300 dark:border-sky-700 rounded-md w-full bg-white dark:bg-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-sm;
        }
        .inline-select-style {
          @apply p-1.5 border border-sky-300 dark:border-sky-700 rounded-md w-full bg-white dark:bg-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-xs;
        }
        .modal-button-secondary { @apply px-5 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm transition-colors; }
        .modal-button-danger { @apply px-5 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm transition-colors; }
      `}</style>
    </motion.div>
  );
}