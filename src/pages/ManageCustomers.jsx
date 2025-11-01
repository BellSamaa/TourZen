// ManageCustomersSupabase.jsx
/* *** (SỬA THEO YÊU CẦU) NÂNG CẤP v12 (Thêm Xác Thực CMND) ***
  1. (Fetch) Cập nhật `fetchCustomers` để join và lấy `user_identity(id, status)`.
  2. (UI) Thêm cột "Xác thực" vào bảng (tbody, thead).
  3. (UI) Thêm nút "Xem CMND" (IdentificationCard) vào cột Thao tác.
  4. (Logic) Thêm state `viewingIdentity` để mở Modal mới.
  5. (Component) Tạo Modal `IdentityModal` hoàn chỉnh cho Admin:
     - Lấy thông tin CMND (bao gồm cả ảnh).
     - Tạo Signed URL an toàn để xem ảnh private.
     - Hiển thị form cho Admin nhập thông tin sau khi xem ảnh.
     - Cung cấp nút "Duyệt" và "Từ chối".
*/
/* NÂNG CẤP v7, v10, v11 (Giữ nguyên) */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaSpinner, FaSearch, FaTrash, FaBell } from "react-icons/fa"; 
import {
  UserList, CaretLeft, CaretRight, CircleNotch, X, Plus, UsersThree, Crown, Sparkle, Wallet,
  PencilSimple, List, Package, Bed, Airplane, Receipt, Info,
  User, Envelope, Phone, House, CalendarBlank,
  IdentificationCard, CheckCircle, WarningCircle, XCircle // <<< THÊM v12
} from "@phosphor-icons/react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const supabase = getSupabase();
const ITEMS_PER_PAGE = 10;

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
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300"; // Tiêu chuẩn
  }
};
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
// --- Component Lấy Dữ Liệu Thống Kê (Logic v6) ---
const CustomerStats = () => {
  // ... (Giữ nguyên code CustomerStats)
  const [stats, setStats] = useState({ total: 0, vip: 0, new: 0, spend: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: users, error: userErr } = await supabase
          .from("Users")
          .select("id")
          .eq("role", "user");
        if (userErr) throw userErr;
        if (!users || users.length === 0) {
          setLoading(false);
          return;
        }
        const { data: bookings, error: bookingErr } = await supabase
          .from("Bookings")
          .select("user_id, total_price")
          .in("user_id", users.map(u => u.id))
          .eq("status", "confirmed");
        if (bookingErr) throw bookingErr;
        let totalSystemSpend = 0;
        const userStatsMap = users.reduce((acc, user) => {
          acc[user.id] = { order_count: 0, total_spend: 0 };
          return acc;
        }, {});
        for (const b of (bookings || [])) {
          if (userStatsMap[b.user_id]) {
            userStatsMap[b.user_id].order_count += 1;
            userStatsMap[b.user_id].total_spend += (b.total_price || 0);
          }
          totalSystemSpend += (b.total_price || 0);
        }
        let vipCount = 0;
        let newCount = 0;
        Object.values(userStatsMap).forEach(stat => {
          if (stat.total_spend > 20000000) {
            vipCount++;
          } 
          else if (stat.order_count >= 1 && stat.order_count <= 2) {
            newCount++;
          }
        });
        setStats({
          total: users.length,
          vip: vipCount,
          new: newCount,
          spend: totalSystemSpend,
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

// --- (*** ĐÃ SỬA: COMPONENT YÊU CẦU RESET MẬT KHẨU SỬ DỤNG REALTIME ***) ---
const PasswordResetRequests = () => {
  // ... (Giữ nguyên code PasswordResetRequests)
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm fetch data
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("password_reset_requests")
        .select("id, email, requested_at, token, expires_at") 
        .eq("is_resolved", false) 
        .order("requested_at", { ascending: true });
      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error("Lỗi tải yêu cầu reset pass:", err);
      toast.error("Lỗi tải yêu cầu reset pass: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Thay thế setInterval bằng Realtime Listener
  useEffect(() => {
    fetchRequests(); // Tải lần đầu

    const channel = supabase.channel('password_reset_channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'password_reset_requests' 
        },
        (payload) => {
          console.log('Realtime update received:', payload.eventType);
          fetchRequests(); 

          if (payload.eventType === 'INSERT') {
             toast(`🔔 Yêu cầu hỗ trợ mật khẩu mới từ: ${payload.new.email}!`, { duration: 5000 });
          }
        }
      )
      .subscribe(); 

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests]);

  // (SỬA v10): Hàm xử lý Tạo Mã OTP 6 Số
  const handleGenerateResetCode = async (id) => {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const { error: updateError } = await supabase
        .from("password_reset_requests")
        .update({ 
          token: otp, 
          expires_at: expires_at,
          is_resolved: false 
        })
        .eq("id", id);
        
      if (updateError) throw updateError;
      
      toast.success(`Đã tạo mã OTP: ${otp}. Vui lòng cung cấp mã này cho khách hàng.`);
      fetchRequests(); 
    } catch (err) {
      console.error("Lỗi tạo mã OTP:", err);
      toast.error("Lỗi tạo mã OTP: " + err.message);
    }
  };

  // (SỬA v10.1): Hàm xử lý Đánh Dấu Đã Giải Quyết (Xóa khỏi danh sách)
  const handleResolveRequest = async (id, email) => {
    try {
      const { error } = await supabase
        .from("password_reset_requests")
        .update({ 
          is_resolved: true
        })
        .eq("id", id);
        
      if (error) throw error;
      
      toast.success(`Đã giải quyết yêu cầu của: ${email}.`);
      fetchRequests(); // Tải lại danh sách
    } catch (err)
    {
      console.error("Lỗi giải quyết yêu cầu:", err);
      toast.error("Lỗi giải quyết yêu cầu: " + err.message);
    }
  };


  if (loading && requests.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-slate-700/50 rounded-lg text-center text-gray-600 dark:text-gray-300 font-medium">
        <CircleNotch size={18} className="animate-spin inline-block mr-2" /> Đang kiểm tra yêu cầu...
      </div>
    );
  }

  // Nếu không có yêu cầu nào thì không hiển thị gì
  if (!loading && requests.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-2xl shadow-xl text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
        <FaBell className="animate-pulse" />
        Yêu Cầu Hỗ Trợ Đổi Mật Khẩu ({requests.length})
      </h3>
      <div className="space-y-3 max-h-60 overflow-y-auto simple-scrollbar pr-2">
        {requests.map((req) => {
          const isExpired = req.expires_at && new Date(req.expires_at) < new Date();
          const hasValidToken = req.token && !isExpired;

          return (
            <motion.div 
              key={req.id} 
              className="flex flex-wrap justify-between items-center bg-white/20 p-4 rounded-lg gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div>
                <span className="font-bold text-lg">{req.email}</span>
                <span className="block text-sm opacity-90">
                  Yêu cầu lúc: {new Date(req.requested_at).toLocaleString('vi-VN')}
                </span>
                {hasValidToken && (
                  <span className="block text-sm font-bold text-green-200 mt-1">
                    Mã OTP: {req.token} (Hiệu lực đến: {new Date(req.expires_at).toLocaleTimeString('vi-VN')})
                  </span>
                )}
                {req.token && isExpired && (
                  <span className="block text-sm font-bold text-yellow-200 mt-1">
                    Mã OTP ({req.token}) đã hết hạn.
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleGenerateResetCode(req.id)} 
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md flex items-center gap-2"
                >
                  <Sparkle/> 
                  {hasValidToken ? "Tạo Lại Mã" : "Tạo Mã OTP"}
                </button>
                <button
                  onClick={() => handleResolveRequest(req.id, req.email)}
                  title="Đánh dấu là đã giải quyết"
                  className="p-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-md flex items-center justify-center"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};


// --- Component Modal Xem Chi Tiết Đơn Hàng ---
const CustomerBookingsModal = ({ customer, onClose }) => {
  // ... (Giữ nguyên code CustomerBookingsModal)
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customer) return;
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
        className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700 border-t-4 border-sky-500"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="flex justify-between items-center mb-6 pb-6 border-b dark:border-slate-700">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Receipt size={30} className="text-sky-600 dark:text-sky-400" />
            <span>Đơn hàng của: <span className="text-sky-600 dark:text-sky-400">{customer.full_name || customer.email}</span>
              {customer.customer_code && (
                <span className="text-base font-medium text-gray-500 dark:text-gray-400 ml-2">({customer.customer_code})</span>
              )}
            </span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={24} weight="bold" />
          </button>
        </div>
        
        <div className="overflow-y-auto pr-2 -mr-4 simple-scrollbar">
          {loading && ( <div className="flex justify-center items-center p-20"> <CircleNotch size={40} className="animate-spin text-sky-500" /> </div> )}
          {error && <p className="text-center text-red-500 p-20">{error}</p>}
          {!loading && !error && bookings.length === 0 && ( <p className="text-center text-gray-500 p-20 italic text-lg">Khách hàng này chưa có đơn hàng nào.</p> )}
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
                          <div className="font-semibold text-base text-gray-900 dark:text-white"> {b.Products?.name || <span className="italic text-gray-400">Dịch vụ đã bị xóa</span>} </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 capitalize"> {b.Products?.product_type || 'N/A'} </div>
                        </div>
                      </div>
                    </td>
                    <td className="td-style text-sm"> {new Date(b.created_at).toLocaleDateString('vi-VN')} </td>
                    <td className="td-style text-right font-semibold text-lg whitespace-nowrap"> {formatCurrency(b.total_price)} </td>
                    <td className="td-style text-center">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadge(b.status)}`}> {b.status} </span>
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

// --- (*** THÊM v12: MODAL XÁC THỰC CMND/CCCD ***) ---
const IdentityModal = ({ customer, onClose, onSuccess }) => {
    const [identity, setIdentity] = useState(null);
    const [formData, setFormData] = useState({ id_number: '', full_name: '', dob: '', issue_date: '', issue_place: '' });
    const [frontImageUrl, setFrontImageUrl] = useState(null);
    const [backImageUrl, setBackImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Hàm tạo Signed URL
    const createSignedUrl = async (filePath) => {
        if (!filePath) return null;
        try {
            const { data, error } = await supabase.storage
                .from('id-scans')
                .createSignedUrl(filePath, 3600); // Hợp lệ trong 1 giờ
            if (error) throw error;
            return data.signedUrl;
        } catch (error) {
            console.error('Lỗi tạo signed URL:', error);
            return null;
        }
    };

    // Fetch dữ liệu và tạo signed URLs
    useEffect(() => {
        const fetchIdentityData = async () => {
            if (!customer) return;
            setLoading(true);
            try {
                // 1. Fetch bản ghi identity
                const { data, error } = await supabase
                    .from('user_identity')
                    .select('*')
                    .eq('id', customer.id)
                    .single();
                
                if (error && error.code !== 'PGRST116') throw error; // Bỏ qua lỗi "không tìm thấy"

                if (data) {
                    setIdentity(data);
                    setFormData({
                        id_number: data.id_number || '',
                        full_name: data.full_name || customer.full_name || '',
                        dob: data.dob ? data.dob.split('T')[0] : (customer.ngay_sinh ? customer.ngay_sinh.split('T')[0] : ''),
                        issue_date: data.issue_date ? data.issue_date.split('T')[0] : '',
                        issue_place: data.issue_place || '',
                    });

                    // 2. Tạo Signed URLs
                    const [frontUrl, backUrl] = await Promise.all([
                        createSignedUrl(data.front_image_url),
                        createSignedUrl(data.back_image_url)
                    ]);
                    setFrontImageUrl(frontUrl);
                    setBackImageUrl(backUrl);
                }
            } catch (err) {
                console.error("Lỗi fetch identity:", err);
                toast.error("Không thể tải thông tin xác thực.");
            } finally {
                setLoading(false);
            }
        };
        fetchIdentityData();
    }, [customer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý Duyệt / Từ chối
    const handleDecision = async (decision) => {
        setIsSaving(true);
        try {
            let updates = { status: decision };
            
            // Nếu "Duyệt", lưu cả thông tin admin đã nhập
            if (decision === 'approved') {
                if (!formData.id_number || !formData.full_name || !formData.dob) {
                    throw new Error("Phải nhập Số CMND, Họ Tên và Ngày sinh trước khi duyệt.");
                }
                updates = { ...updates, ...formData };
            }

            const { error } = await supabase
                .from('user_identity')
                .update(updates)
                .eq('id', customer.id);
            
            if (error) throw error;

            toast.success(`Đã ${decision === 'approved' ? 'Duyệt' : 'Từ chối'} hồ sơ.`);
            onSuccess(); // Gọi hàm refresh bảng
            onClose();

        } catch (error) {
            toast.error(`Lỗi: ${error.message}`);
        } finally {
            setIsSaving(false);
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
                className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700 border-t-4 border-violet-500"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
            >
                <div className="flex justify-between items-center mb-6 p-6 border-b dark:border-slate-700">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <IdentificationCard size={30} className="text-violet-600 dark:text-violet-400" />
                        <span>Duyệt Thông Tin Xác Thực</span>
                    </h3>
                    <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X size={24} weight="bold" />
                    </button>
                </div>
                
                <div className="overflow-y-auto px-6 pb-6 simple-scrollbar">
                    {loading && ( <div className="flex justify-center items-center p-20"> <CircleNotch size={40} className="animate-spin text-violet-500" /> </div> )}
                    
                    {!loading && !identity && ( <p className="text-center text-gray-500 p-20 italic text-lg">Khách hàng này chưa gửi thông tin xác thực.</p> )}
                    
                    {!loading && identity && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Cột 1: Ảnh Scan */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Ảnh Scan</h4>
                                <div className="space-y-3">
                                    <label className="text-sm font-medium dark:text-gray-400">Mặt trước</label>
                                    {frontImageUrl ? (
                                        <a href={frontImageUrl} target="_blank" rel="noopener noreferrer"><img src={frontImageUrl} alt="Mặt trước CMND" className="w-full rounded-lg border dark:border-slate-600" /></a>
                                    ) : (<p className="text-sm italic text-gray-500">Chưa tải lên</p>)}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-medium dark:text-gray-400">Mặt sau</label>
                                    {backImageUrl ? (
                                        <a href={backImageUrl} target="_blank" rel="noopener noreferrer"><img src={backImageUrl} alt="Mặt sau CMND" className="w-full rounded-lg border dark:border-slate-600" /></a>
                                    ) : (<p className="text-sm italic text-gray-500">Chưa tải lên</p>)}
                                </div>
                            </div>

                            {/* Cột 2: Form Nhập liệu của Admin */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Thông tin (Admin nhập)</h4>
                                <InputWrapper label="Số CMND/CCCD" icon={<IdentificationCard size={18} className="mr-2" />}>
                                    <input type="text" name="id_number" value={formData.id_number} onChange={handleChange} className="form-input-style" placeholder="Nhập số từ ảnh..." />
                                </InputWrapper>
                                <InputWrapper label="Họ và Tên" icon={<User size={18} className="mr-2" />}>
                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="form-input-style" placeholder="Nhập tên từ ảnh..." />
                                </InputWrapper>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputWrapper label="Ngày sinh" icon={<CalendarBlank size={18} className="mr-2" />}>
                                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="form-input-style" />
                                    </InputWrapper>
                                    <InputWrapper label="Ngày cấp" icon={<CalendarBlank size={18} className="mr-2" />}>
                                        <input type="date" name="issue_date" value={formData.issue_date} onChange={handleChange} className="form-input-style" />
                                    </InputWrapper>
                                </div>
                                <InputWrapper label="Nơi cấp" icon={<House size={18} className="mr-2" />}>
                                    <input type="text" name="issue_place" value={formData.issue_place} onChange={handleChange} className="form-input-style" placeholder="Nhập nơi cấp từ ảnh..." />
                                </InputWrapper>
                            </div>
                        </div>
                    )}
                </div>

                {!loading && identity && (
                    <div className="p-6 flex justify-end gap-4 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 rounded-b-2xl">
                        <button type="button" onClick={() => handleDecision('rejected')} disabled={isSaving} className="modal-button-danger min-w-[120px]">
                            {isSaving ? <CircleNotch className="animate-spin" /> : 'Từ chối'}
                        </button>
                        <button type="button" onClick={() => handleDecision('approved')} disabled={isSaving} className="modal-button-primary min-w-[120px]">
                            {isSaving ? <CircleNotch className="animate-spin" /> : 'Duyệt Hồ Sơ'}
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};
// --- (*** KẾT THÚC v12 ***) ---

// --- (*** FIX v7.7 ***) Component InputWrapper (Đã di chuyển ra ngoài) ---
const InputWrapper = ({ label, icon, children }) => (
  <div className="mb-5">
    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
      {icon}
      {label}
    </label>
    <div className="relative">
      {children}
    </div>
  </div>
);
// ... (Giữ nguyên nội dung còn lại của ManageCustomersSupabase)
// --- Component Form (Logic v6) ---
// (SỬA v11) - Không cần thay đổi Form, vì customer_code được tạo tự động bởi DB Trigger.
const CustomerForm = ({ initialData, onSubmit, isSaving, onCancel }) => {
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    phone_number: initialData?.phone_number || '',
    address: initialData?.address || '',
    ngay_sinh: initialData?.ngay_sinh ? initialData.ngay_sinh.split('T')[0] : '',
  });
  const isEditMode = !!initialData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name?.trim()) {
      toast.error("Tên khách hàng không được để trống.");
      return;
    }
    if (!formData.email?.trim()) {
      toast.error("Email không được để trống.");
      return;
    }
    const dataToSubmit = {
      ...formData,
      phone_number: formData.phone_number?.trim() || null,
      address: formData.address?.trim() || null,
      ngay_sinh: formData.ngay_sinh || null,
    };
    onSubmit(dataToSubmit);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <InputWrapper label="Họ và Tên" icon={<User size={18} className="mr-2" />}>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="form-input-style" placeholder="Nguyễn Văn A" required />
        </InputWrapper>
        <InputWrapper label="Email" icon={<Envelope size={18} className="mr-2" />}>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className={`form-input-style ${isEditMode ? 'bg-gray-100 dark:bg-slate-700 cursor-not-allowed' : ''}`} placeholder="example@gmail.com" required disabled={isEditMode} />
        </InputWrapper>
        <InputWrapper label="Số Điện Thoại" icon={<Phone size={18} className="mr-2" />}>
          <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="form-input-style" placeholder="090..." />
        </InputWrapper>
        <InputWrapper label="Ngày Sinh" icon={<CalendarBlank size={18} className="mr-2" />}>
          <input type="date" name="ngay_sinh" value={formData.ngay_sinh} onChange={handleChange} className="form-input-style" />
        </InputWrapper>
      </div>
      <InputWrapper label="Địa chỉ" icon={<House size={18} className="mr-2" />}>
        <textarea name="address" value={formData.address} onChange={handleChange} className="form-input-style min-h-[80px]" placeholder="Số 1, đường..." />
      </InputWrapper>
      <div className="flex justify-end gap-4 pt-6 border-t dark:border-slate-700 mt-2">
        <button type="button" onClick={onCancel} disabled={isSaving} className="modal-button-secondary"> Hủy </button>
        <button type="submit" disabled={isSaving} className="modal-button-primary">
          {isSaving ? ( <CircleNotch size={20} className="animate-spin" /> ) : ( isEditMode ? "Lưu thay đổi" : "Thêm Khách Hàng" )}
        </button>
      </div>
    </form>
  );
};

// --- Component Modal Chung (Giữ nguyên) ---
const FormModal = ({ title, onClose, children }) => (
  <motion.div
    className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 flex justify-center items-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700 border-t-4 border-sky-500"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center mb-6 pb-6 border-b dark:border-slate-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <X size={24} weight="bold" />
        </button>
      </div>
      <div className="overflow-y-auto pr-2 -mr-4 simple-scrollbar">
        {children}
      </div>
    </motion.div>
  </motion.div>
);

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

  const [isSaving, setIsSaving] =useState(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); 
  
  const [viewingBookingsCustomer, setViewingBookingsCustomer] = useState(null);
  const [viewingIdentity, setViewingIdentity] = useState(null); // <<< THÊM v12
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // --- (SỬA v12) Fetch customers (Join user_identity) ---
  const fetchCustomers = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad) setIsFetchingPage(true);
    setError(null);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      let countQuery = supabase.from("Users").select("id", { count: "exact", head: true }).eq("role", "user");
      
      // (SỬA v12) Thêm join với user_identity (lấy id và status)
      let dataQuery = supabase.from("Users")
          .select("*, customer_tier, ngay_sinh, customer_code, user_identity(id, status)")
          .eq("role", "user");
      
      if (debouncedSearch.trim() !== "") {
        const searchTerm = `%${debouncedSearch.trim()}%`;
        const searchQuery = `customer_code.ilike.${searchTerm},full_name.ilike.${searchTerm},email.ilike.${searchTerm},address.ilike.${searchTerm},phone_number.ilike.${searchTerm}`;
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
      
      const combinedData = usersData.map((user) => {
        const order_count = statsMap[user.id]?.order_count || 0;
        const total_spend = statsMap[user.id]?.total_spend || 0;
        let dynamic_tier = 'Tiêu chuẩn';
        if (total_spend > 20000000) {
            dynamic_tier = 'VIP';
        } else if (order_count >= 1 && order_count <= 2) {
            dynamic_tier = 'Mới';
        } else if (order_count > 2) {
            dynamic_tier = 'Thường xuyên';
        }
        
        // (SỬA v12) Xử lý user_identity: nó là một mảng (do join), ta chỉ cần phần tử đầu tiên (hoặc null)
        const identity = Array.isArray(user.user_identity) ? user.user_identity[0] : user.user_identity;

        return { 
            ...user, 
            user_identity: identity, // Ghi đè lại thành object hoặc null
            order_count: order_count, 
            total_spend: total_spend, 
            customer_tier: dynamic_tier, 
            ngay_sinh: user.ngay_sinh ? user.ngay_sinh.split('T')[0] : '', 
        };
      });
      
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
  // --- KẾT THÚC SỬA v12 ---

  useEffect(() => {
    const isInitial = customers.length === 0 && loading;
    fetchCustomers(isInitial);
  }, [fetchCustomers, customers.length, loading]);

  useEffect(() => {
    if (currentPage !== 1) { setCurrentPage(1); }
  }, [debouncedSearch]);

  // --- Handlers cho Modal Form (Bọc useCallback) ---
  const handleUpdateCustomer = useCallback(async (formData) => {
    if (!editingCustomer || isSaving) return;
    setIsSaving(true);
    const updateData = { full_name: formData.full_name, address: formData.address, phone_number: formData.phone_number, ngay_sinh: formData.ngay_sinh, };
    try {
      const { error } = await supabase.from("Users").update(updateData).eq("id", editingCustomer.id);
      if (error) throw error;
      toast.success("Cập nhật khách hàng thành công!");
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error("Lỗi lưu:", err);
      toast.error(`Không thể lưu dữ liệu: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [editingCustomer, isSaving, fetchCustomers]); 

  // (SỬA v11) - Không cần thay đổi logic AddNew, Trigger của DB sẽ tự thêm code
  const handleAddNewCustomer = useCallback(async (formData) => {
    if (isSaving) return;
    setIsSaving(true);
    const insertData = { ...formData, role: 'user' };
    try {
      const { error } = await supabase.from("Users").insert([insertData]); 
      if (error) {
        if (error.code === '23505') { throw new Error("Email này đã tồn tại trong hệ thống."); }
        throw error;
      }
      toast.success("Thêm khách hàng mới thành công!");
      setIsAddingCustomer(false);
      fetchCustomers();
    } catch (err) {
      console.error("Lỗi thêm mới:", err);
      toast.error(`Thêm thất bại: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, fetchCustomers]);

  // --- Handlers ổn định để đóng/mở Modals ---
  const handleOpenAddModal = useCallback(() => { setIsAddingCustomer(true); }, []);
  const handleCloseAddModal = useCallback(() => { setIsAddingCustomer(false); }, []);
  const handleCloseEditModal = useCallback(() => { setEditingCustomer(null); }, []);
  const handleCloseBookingsModal = useCallback(() => { setViewingBookingsCustomer(null); }, []);
  const handleCloseIdentityModal = useCallback(() => { setViewingIdentity(null); }, []); // <<< THÊM v12

  // --- Delete Handlers (Bọc useCallback) ---
  const openDeleteConfirm = useCallback((c) => { setSelectedCustomer(c); setShowDeleteConfirm(true); }, []);
  const closeDeleteConfirm = useCallback(() => { setSelectedCustomer(null); setShowDeleteConfirm(false); }, []);
  const handleDelete = useCallback(async () => {
    if (!selectedCustomer) return;
    try {
      // (SỬA v12) Sửa: Lỗi này chỉ xóa hồ sơ, không xóa auth. 
      // (Ghi chú: Giữ nguyên logic cũ theo yêu cầu, chỉ xóa hồ sơ Users, không xóa auth)
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
  }, [selectedCustomer, customers.length, currentPage, fetchCustomers, closeDeleteConfirm]);

  const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

  // --- (FIX v7) Loading Screen (Đổi class font) ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 font-vietnam-main">
        <CircleNotch className="animate-spin text-sky-500" size={52} />
        <p className="text-slate-500 dark:text-slate-400 mt-5 font-semibold text-lg"> Đang tải dữ liệu... </p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-8xl mx-auto p-6 sm:p-8 space-y-8 min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 font-vietnam-main"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <motion.h1 
            className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 font-vietnam-main"
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
          onClick={handleOpenAddModal}
          className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all duration-300 font-semibold focus:outline-none focus:ring-4 focus:ring-sky-300"
        >
          <Plus size={20} weight="bold" />
          Thêm Khách Hàng
        </button>
      </div>

      <CustomerStats />

      {/* --- (*** SỬA v10.1: COMPONENT YÊU CẦU RESET MẬT KHẨU ***) --- */}
      <PasswordResetRequests />
      {/* --- (*** KẾT THÚC SỬA v10.1 ***) --- */}

      {/* (Ghi chú: Bảng này đã có sẵn rounded-2xl và shadow-2xl từ v11) */}
      <div className="bg-white dark:bg-slate-800 shadow-2xl shadow-gray-200/50 dark:shadow-black/30 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
        <div className="p-5 border-b border-gray-200 dark:border-slate-700">
          <div className="relative flex-grow w-full max-w-lg">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng (Mã KH, tên, email, SĐT...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 text-base rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all duration-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto relative">
          {(isFetchingPage || isSaving) && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10">
              <CircleNotch size={36} className="animate-spin text-sky-500" />
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/40">
              <tr>
                {/* (SỬA v11) Thêm cột Mã KH */}
                <th className="th-style">Mã KH</th>
                <th className="th-style">Họ và tên</th>
                <th className="th-style">Liên hệ</th>
                <th className="th-style">Ngày sinh</th>
                <th className="th-style text-center">Đơn</th>
                <th className="th-style text-right">Tổng chi</th>
                <th className="th-style text-center">Loại (Tự động)</th>
                {/* (SỬA v12) Thêm cột Xác thực */}
                <th className="th-style text-center">Xác thực</th>
                <th className="th-style text-center">Thao tác</th>
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-gray-100 dark:divide-slate-700"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {/* (SỬA v12) Sửa colSpan="9" */}
              {error && !isFetchingPage && ( <tr><td colSpan="9" className="p-10 text-center text-red-500">{error}</td></tr> )}
              {!error && !loading && !isFetchingPage && customers.length === 0 && ( 
                <tr>
                  {/* (SỬA v12) Sửa colSpan="9" */}
                  <td colSpan="9" className="p-16 text-center text-gray-500">
                    <UserList size={48} className="mx-auto text-gray-400" />
                    <span className="mt-4 text-lg font-medium">{debouncedSearch ? "Không tìm thấy khách hàng." : "Chưa có dữ liệu."}</span>
                  </td>
                </tr> 
              )}
              
              {!error && customers.map((c) => {
                const tierStyle = getCustomerTierStyle(c.customer_tier); 
                
                // (SỬA v12) Lấy thông tin xác thực
                const identityStatus = c.user_identity?.status;
                let statusBadge;
                if (identityStatus === 'approved') {
                    statusBadge = <span className="badge-status-pro bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"><CheckCircle size={14} weight="bold"/>Đã xác thực</span>;
                } else if (identityStatus === 'pending') {
                    statusBadge = <span className="badge-status-pro bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"><WarningCircle size={14} weight="bold"/>Chờ duyệt</span>;
                } else if (identityStatus === 'rejected') {
                    statusBadge = <span className="badge-status-pro bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"><XCircle size={14} weight="bold"/>Bị từ chối</span>;
                } else {
                    statusBadge = <span className="badge-status-pro bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-300"><XCircle size={14} weight="bold"/>Chưa gửi</span>;
                }

                return (
                  <motion.tr
                    key={c.id}
                    className="transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    variants={cardVariants}
                    whileHover={{ y: -2 }}
                  >
                    {/* (SỬA v11) Thêm ô Mã KH */}
                    <td className="td-style">
                      <span className="font-bold text-sm text-sky-600 dark:text-sky-400">{c.customer_code || <span className="italic text-gray-400">N/A</span>}</span>
                    </td>
                    <td className="td-style">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{c.full_name || <span className="italic text-gray-400">...</span>}</span>
                    </td>
                    <td className="td-style whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{c.email}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{c.phone_number || "..."}</span>
                      </div>
                    </td>
                    <td className="td-style">
                      <span className="text-sm whitespace-nowrap">
                        {c.ngay_sinh ? new Date(c.ngay_sinh).toLocaleDateString('vi-VN') : <span className="italic text-gray-400">...</span>}
                      </span>
                    </td>
                    <td className="td-style text-center font-bold text-sm text-sky-600 dark:text-sky-400">{c.order_count}</td>
                    <td className="td-style text-right font-bold text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {formatCurrency(c.total_spend)}
                    </td>
                    <td className="td-style text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${tierStyle}`}>
                        {c.customer_tier}
                      </span>
                    </td>
                    {/* (SỬA v12) Thêm ô Xác thực */}
                    <td className="td-style text-center">
                        {statusBadge}
                    </td>
                    <td className="td-style text-center whitespace-nowrap space-x-1">
                        <>
                          <button onClick={() => setViewingBookingsCustomer(c)} disabled={isFetchingPage || !!editingCustomer || isAddingCustomer} className="action-button text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30" title="Xem các đơn hàng"><List size={20} weight="bold" /></button>
                          {/* (SỬA v12) Thêm nút xem CMND */}
                          <button onClick={() => setViewingIdentity(c)} disabled={isFetchingPage || !!editingCustomer || isAddingCustomer || !c.user_identity} className="action-button text-violet-500 hover:bg-violet-100 dark:hover:bg-violet-900/30 disabled:opacity-30" title="Xem Xác thực CMND"><IdentificationCard size={20} weight="bold" /></button>
                          <button onClick={() => setEditingCustomer(c)} disabled={isFetchingPage || !!editingCustomer || isAddingCustomer} className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa thông tin"><PencilSimple size={20} weight="bold" /></button>
                          <button onClick={() => openDeleteConfirm(c)} disabled={isFetchingPage || !!editingCustomer || isAddingCustomer} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa hồ sơ"><FaTrash size={18} /></button>
                        </>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      </div>

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

      {/* --- Modals (Sử dụng handlers ổn định) --- */}
      <AnimatePresence>
        {viewingBookingsCustomer && (
          <CustomerBookingsModal
            customer={viewingBookingsCustomer}
            onClose={handleCloseBookingsModal}
          />
        )}
      </AnimatePresence>
      
      {/* <<< THÊM v12: Modal Xác thực CMND >>> */}
      <AnimatePresence>
        {viewingIdentity && (
            <IdentityModal
                customer={viewingIdentity}
                onClose={handleCloseIdentityModal}
                onSuccess={() => {
                    fetchCustomers(false); // Refresh lại bảng
                }}
            />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && selectedCustomer && (
          <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div 
              className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center border border-gray-200 dark:border-slate-700 border-t-4 border-red-500"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            >
              <h4 className="text-xl font-bold text-red-600 dark:text-red-500 mb-4"> Xác nhận xóa hồ sơ </h4>
              <p className="mb-8 text-base text-gray-700 dark:text-gray-300">
                Bạn có chắc muốn xóa hồ sơ của{" "} 
                <b className="text-gray-900 dark:text-white">{selectedCustomer.full_name || selectedCustomer.email} ({selectedCustomer.customer_code})</b>?
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
      <AnimatePresence>
        {isAddingCustomer && (
          <FormModal title="Thêm Khách Hàng Mới" onClose={handleCloseAddModal}>
            <CustomerForm
              isSaving={isSaving}
              onSubmit={handleAddNewCustomer}
              onCancel={handleCloseAddModal}
            />
          </FormModal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingCustomer && (
          <FormModal title="Chỉnh Sửa Thông Tin Khách Hàng" onClose={handleCloseEditModal}>
            <CustomerForm
              initialData={editingCustomer}
              isSaving={isSaving}
              onSubmit={handleUpdateCustomer}
              onCancel={handleCloseEditModal}
            />
          </FormModal>
        )}
      </AnimatePresence>
      
      {/* (FIX v7) Đổi font "Be Vietnam Pro" */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');
        :root { --font-main: 'Be Vietnam Pro', sans-serif; }
        body, .font-vietnam-main { font-family: var(--font-main), sans-serif; }
      `}</style>
      <style jsx>{`
        .th-style { @apply px-6 py-5 text-left text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider; }
        .td-style { @apply px-6 py-6 text-sm text-gray-600 dark:text-gray-300 align-middle; }
        .action-button { @apply p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95; }
        .pagination-arrow { @apply p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
        .pagination-number { @apply w-10 h-10 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-base; }
        .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
        .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
        .form-input-style { @apply p-3.5 border border-slate-300 dark:border-slate-600 rounded-lg w-full bg-white dark:bg-slate-700/50 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition duration-200 text-base; }
        .modal-button-secondary { @apply px-6 py-3 bg-neutral-200 dark:bg-neutral-700 rounded-lg font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-600 text-sm transition-all duration-200 disabled:opacity-50; }
        .modal-button-danger { @apply px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 text-sm transition-all duration-200 shadow-lg shadow-red-500/30; }
        .modal-button-primary { @apply flex items-center justify-center px-6 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 text-sm transition-all duration-200 shadow-lg shadow-sky-500/30 disabled:opacity-50; }
        .simple-scrollbar::-webkit-scrollbar { width: 8px; }
        .simple-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .simple-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .dark .simple-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; }
        
        /* (SỬA v12) Thêm style cho badge xác thực */
        .badge-status-pro {
            @apply px-3 py-1 text-xs font-semibold rounded-md inline-flex items-center gap-1.5;
        }
      `}</style>
    </motion.div>
  );
}