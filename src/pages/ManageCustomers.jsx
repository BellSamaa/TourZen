// ManageCustomersSupabase.jsx
// (UPGRADED: Giao diện giống ảnh mockup, tích hợp stats từ Bookings)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaSpinner,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUsers,
  FaUserPlus,
  FaUserCheck,
  FaUserClock,
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
} from "@phosphor-icons/react"; // <<< THÊM Icons mới
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

const supabase = getSupabase();
const ITEMS_PER_PAGE = 10; // Giảm số lượng để khớp với ảnh
const VIP_THRESHOLD = 20000000; // 20 triệu
const FREQUENT_THRESHOLD = 3; // 3 đơn hàng

// --- Hook Debounce ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// --- Helper Pagination Window ---
const getPaginationWindow = (currentPage, totalPages, width = 2) => {
  if (totalPages <= 1) return [];
  if (totalPages <= 5 + width * 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set([1]);
  for (
    let i = Math.max(2, currentPage - width);
    i <= Math.min(totalPages - 1, currentPage + width);
    i++
  ) {
    pages.add(i);
  }
  pages.add(totalPages);
  const sortedPages = [...pages].sort((a, b) => a - b);
  const finalPages = [];
  let lastPage = 0;
  for (const page of sortedPages) {
    if (lastPage !== 0 && page - lastPage > 1) {
      finalPages.push("...");
    }
    finalPages.push(page);
    lastPage = page;
  }
  return finalPages;
};

// --- (MỚI) Helper Format Currency ---
const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- (MỚI) Helper Format Stats Number (e.g., 2.5 tỷ) ---
const formatStatsNumber = (num) => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + " tỷ";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + " triệu";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + " k";
  }
  return num;
};

// --- (MỚI) Badge + Logic theo loại khách hàng ---
const getCustomerType = (customer) => {
  // Logic "Mới" (Giả sử bảng Users có cột created_at)
  if (customer.created_at) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (new Date(customer.created_at) > thirtyDaysAgo) {
      return {
        label: "Mới",
        badge:
          "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
      };
    }
  }

  // Logic "VIP"
  if (customer.total_spend >= VIP_THRESHOLD) {
    return {
      label: "VIP",
      badge:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    };
  }

  // Logic "Thường xuyên"
  if (customer.order_count >= FREQUENT_THRESHOLD) {
    return {
      label: "Thường xuyên",
      badge:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    };
  }

  // Mặc định
  return {
    label: "Tiêu chuẩn",
    badge:
      "bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-300",
  };
};

// --- (MỚI) Component Thẻ Thống kê ---
const StatCard = ({ title, value, icon, loading }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
    <div className="p-3 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      {loading ? (
        <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div>
      ) : (
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      )}
    </div>
  </div>
);

// --- (MỚI) Component Lấy Dữ Liệu Thống Kê ---
const CustomerStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    vip: 0,
    new: 0,
    spend: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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

        // 3. Khách hàng mới (30 ngày qua, giả sử có cột created_at)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count: newCount, error: newErr } = await supabase
          .from("Users")
          .select("id", { count: "exact", head: true })
          .eq("role", "user")
          .gte("created_at", thirtyDaysAgo.toISOString());
        // Bỏ qua lỗi nếu cột created_at không tồn tại
        if (newErr) console.warn("Lỗi fetch new users:", newErr.message);

        // 4. Khách hàng VIP (Phức tạp nhất: client-side aggregate)
        const { data: allBookings, error: bookingsErr } = await supabase
          .from("Bookings")
          .select("user_id, total_price")
          .eq("status", "confirmed");
        if (bookingsErr) throw bookingsErr;

        const spendByUser = allBookings.reduce((acc, b) => {
          acc[b.user_id] = (acc[b.user_id] || 0) + (b.total_price || 0);
          return acc;
        }, {});
        const vipCount = Object.values(spendByUser).filter(
          (spend) => spend >= VIP_THRESHOLD
        ).length;

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
      <StatCard
        title="Tổng khách hàng"
        value={stats.total}
        loading={loading}
        icon={<UsersThree size={22} weight="duotone" />}
      />
      <StatCard
        title="Khách hàng VIP"
        value={stats.vip}
        loading={loading}
        icon={<Crown size={22} weight="duotone" />}
      />
      <StatCard
        title="Khách hàng mới"
        value={stats.new}
        loading={loading}
        icon={<Sparkle size={22} weight="duotone" />}
      />
      <StatCard
        title="Tổng chi tiêu"
        value={formatStatsNumber(stats.spend)}
        loading={loading}
        icon={<Wallet size={22} weight="duotone" />}
      />
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

  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    address: "",
    email: "",
    phone_number: "",
  });
  const [formError, setFormError] = useState("");

  // --- (ĐÃ SỬA) Fetch customers VÀ booking stats ---
  const fetchCustomers = useCallback(
    async (isInitialLoad = false) => {
      if (!isInitialLoad) setIsFetchingPage(true);
      setError(null);
      try {
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        // 1. Chuẩn bị truy vấn (Chỉ lấy role 'user')
        let countQuery = supabase
          .from("Users")
          .select("id", { count: "exact", head: true })
          .eq("role", "user");

        let dataQuery = supabase.from("Users").select("*").eq("role", "user");

        // 2. Áp dụng Search
        if (debouncedSearch.trim() !== "") {
          const searchTerm = `%${debouncedSearch.trim()}%`;
          const searchQuery = `full_name.ilike.${searchTerm},email.ilike.${searchTerm},address.ilike.${searchTerm},phone_number.ilike.${searchTerm}`;
          countQuery = countQuery.or(searchQuery);
          dataQuery = dataQuery.or(searchQuery);
        }

        // 3. Áp dụng Order & Pagination
        dataQuery = dataQuery
          .order("full_name", { ascending: true })
          .range(from, to);

        // 4. Chạy truy vấn lấy Users và Count
        const { count, error: countError } = await countQuery;
        if (countError) throw countError;

        const { data: usersData, error: usersError } = await dataQuery;
        if (usersError) throw usersError;

        if (!usersData || usersData.length === 0) {
          setCustomers([]);
          setTotalItems(count || 0);
          if (!isInitialLoad && count > 0 && currentPage > 1) {
             setCurrentPage(1); // Reset về trang 1 nếu trang hiện tại trống
          }
          return;
        }

        // 5. (MỚI) Lấy stats (Số đơn, Tổng chi) cho NHỮNG user ID này
        const userIds = usersData.map((u) => u.id);
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("Bookings")
          .select("user_id, total_price")
          .in("user_id", userIds)
          .eq("status", "confirmed");

        if (bookingsError) {
          console.warn(
            "Lỗi fetch bookings stats:",
            bookingsError.message
          );
          // Không fatal, tiếp tục mà không có stats
        }

        // 6. (MỚI) Gộp dữ liệu (Client-side aggregation)
        const statsMap = (bookingsData || []).reduce((acc, booking) => {
          const userId = booking.user_id;
          if (!acc[userId]) {
            acc[userId] = { order_count: 0, total_spend: 0 };
          }
          acc[userId].order_count += 1;
          acc[userId].total_spend += booking.total_price || 0;
          return acc;
        }, {});

        const combinedData = usersData.map((user) => ({
          ...user,
          order_count: statsMap[user.id]?.order_count || 0,
          total_spend: statsMap[user.id]?.total_spend || 0,
        }));

        setCustomers(combinedData);
        setTotalItems(count || 0);
      } catch (err) {
        console.error("Lỗi fetch khách hàng:", err);
        const errorMsg = err.message || "Không thể tải danh sách khách hàng.";
        setError(errorMsg);
        toast.error(`Lỗi tải danh sách: ${errorMsg}`);
        setCustomers([]);
        setTotalItems(0);
      } finally {
        if (isInitialLoad) setLoading(false);
        setIsFetchingPage(false);
      }
    },
    [currentPage, debouncedSearch]
  ); // <<< Đã bỏ filterRole, filterActive

  // --- Trigger fetch ---
  useEffect(() => {
    const isInitial = customers.length === 0 && loading;
    fetchCustomers(isInitial);
  }, [fetchCustomers, customers.length, loading]);

  // --- Reset page on search ---
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // --- Form Handlers (Chỉ SỬA, không THÊM) ---
  // (Giữ logic cũ: trang này chỉ quản lý, không tạo user mới)
  const openForm = (customer) => {
    if (!customer) {
      // Logic cho nút "Thêm" - KHÔNG NÊN tạo user từ đây
      // vì bảng Users cần ID từ auth.users
      toast('Chức năng "Thêm Khách Hàng" cần quy trình mời (invite) riêng.', {
        icon: "ℹ️",
      });
      return;
      // // Nếu muốn mở form thêm (không khuyến nghị):
      // setSelectedCustomer(null);
      // setForm({ full_name: "", address: "", email: "", phone_number: "" });
      // setFormError("");
      // setShowForm(true);
    } else {
      // Logic sửa
      setFormError("");
      setSelectedCustomer(customer);
      setForm({
        full_name: customer.full_name || "",
        address: customer.address || "",
        email: customer.email || "", // Email không cho sửa
        phone_number: customer.phone_number || "",
      });
      setShowForm(true);
    }
  };
  const closeForm = () => {
    setShowForm(false);
    setSelectedCustomer(null);
    setForm({ full_name: "", address: "", email: "", phone_number: "" });
    setFormError("");
  };
  const validateForm = () => {
    if (!form.full_name?.trim()) return "Tên không được trống.";
    return "";
  };
  const handleSave = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) return setFormError(err);
    setFormError("");
    
    if (selectedCustomer) {
      // --- Logic SỬA ---
      const updateData = {
        full_name: form.full_name.trim(),
        address: form.address ? form.address.trim() : null,
        phone_number: form.phone_number ? form.phone_number.trim() : null,
      };

      // Kiểm tra thay đổi
      if (
        updateData.full_name === selectedCustomer.full_name &&
        updateData.address === (selectedCustomer.address || null) &&
        updateData.phone_number === (selectedCustomer.phone_number || null)
      ) {
        toast("Không có thay đổi để lưu.");
        closeForm();
        return;
      }

      try {
        const { error } = await supabase
          .from("Users")
          .update(updateData)
          .eq("id", selectedCustomer.id);
        if (error) throw error;
        toast.success("Cập nhật khách hàng thành công!");
        fetchCustomers();
        closeForm();
      } catch (err) {
        console.error("Lỗi lưu:", err);
        setFormError(`Không thể lưu dữ liệu: ${err.message}`);
        toast.error(`Lỗi lưu: ${err.message}`);
      }
    } else {
      // --- Logic THÊM (Bị vô hiệu hóa) ---
      // Không thực hiện vì thiếu logic tạo auth.users
       toast.error("Chức năng thêm mới không được hỗ trợ từ giao diện này.");
    }
  };

  // --- Delete Handlers ---
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
      // Lưu ý: Thao tác này chỉ xóa hồ sơ trong bảng 'Users'
      // Nó KHÔNG xóa tài khoản trong 'auth.users'
      // (Để xóa auth user, cần gọi hàm RLS từ Edge Function)
      const { error }_ = await supabase
        .from("Users")
        .delete()
        .eq("id", selectedCustomer.id);
      if (error) throw error;
      toast.success(
        `Đã xóa hồ sơ "${selectedCustomer.full_name || selectedCustomer.email}"!`
      );
      if (customers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchCustomers();
      }
      closeDeleteConfirm();
    } catch (err) {
      console.error("Lỗi xóa:", err);
      toast.error(
        `Xóa thất bại: ${err.message}. (Lưu ý: Không thể xóa nếu khách hàng đã có đơn đặt)`
      );
    }
  };

  // --- Pagination Window ---
  const paginationWindow = useMemo(
    () => getPaginationWindow(currentPage, totalPages, 2),
    [currentPage, totalPages]
  );

  // --- Loading ban đầu ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-24 text-center">
        <FaSpinner className="animate-spin text-sky-500" size={40} />
        <p className="text-slate-500 mt-3 font-medium">
          {" "}
          Đang tải danh sách khách hàng...{" "}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-50/50 dark:bg-slate-900 dark:text-white">
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
          onClick={() => openForm(null)} // Mở form thêm mới (đã bị chặn)
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg shadow-md hover:bg-sky-700 transition font-semibold"
        >
          <Plus size={18} weight="bold" />
          Thêm Khách Hàng
        </button>
      </div>

      {/* (MỚI) Thống kê */}
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
          {isFetchingPage && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10">
              <CircleNotch size={32} className="animate-spin text-sky-500" />
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/40">
              <tr>
                <th className="th-style">Mã KH</th>
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
              {error && !isFetchingPage && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              )}
              {!error &&
                !loading &&
                !isFetchingPage &&
                customers.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-8 text-center text-gray-500 italic"
                    >
                      {debouncedSearch
                        ? "Không tìm thấy khách hàng."
                        : "Chưa có dữ liệu."}
                    </td>
                  </tr>
                )}
              {!error &&
                customers.map((c, index) => {
                  const typeStyle = getCustomerType(c);
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="td-style font-medium text-gray-700 dark:text-gray-300">
                        KH-
                        {String(
                          (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                        ).padStart(3, "0")}
                      </td>
                      <td className="td-style font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {c.full_name || (
                          <span className="italic text-gray-400">
                            Chưa cập nhật
                          </span>
                        )}
                      </td>
                      <td className="td-style whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-800 dark:text-gray-200">
                            {c.email}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {c.phone_number || "Chưa có SĐT"}
                          </span>
                        </div>
                      </td>
                      <td className="td-style max-w-xs truncate">
                        {c.address || (
                          <span className="italic text-gray-400">Chưa có</span>
                        )}
                      </td>
                      <td className="td-style text-center">
                        {c.order_count}
                      </td>
                      <td className="td-style text-right font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {formatCurrency(c.total_spend)}
                      </td>
                      <td className="td-style text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyle.badge}`}
                        >
                          {typeStyle.label}
                        </span>
                      </td>
                      <td className="td-style text-center whitespace-nowrap space-x-1">
                        <button
                          onClick={() => openForm(c)}
                          disabled={isFetchingPage}
                          className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          title="Sửa thông tin"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(c)}
                          disabled={isFetchingPage}
                          className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                          title="Xóa hồ sơ"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Pagination UI --- */}
      {!loading && totalItems > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          <div>
            {" "}
            Hiển thị{" "}
            <span className="font-semibold dark:text-white">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold dark:text-white">
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
            </span>{" "}
            /{" "}
            <span className="font-semibold dark:text-white">
              {totalItems}
            </span>{" "}
            khách hàng{" "}
          </div>
          <div className="flex items-center gap-1 mt-3 sm:mt-0">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1 || isFetchingPage}
              className="pagination-arrow"
              aria-label="Trang trước"
            >
              <CaretLeft weight="bold" />
            </button>
            {paginationWindow.map((pageNumber, idx) =>
              pageNumber === "..." ? (
                <span key={`dots-${idx}`} className="pagination-dots">
                  ...
                </span>
              ) : (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  disabled={isFetchingPage}
                  className={`pagination-number ${
                    currentPage === pageNumber ? "pagination-active" : ""
                  }`}
                >
                  {pageNumber}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || isFetchingPage}
              className="pagination-arrow"
              aria-label="Trang sau"
            >
              <CaretRight weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* --- Modals --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4">
          {" "}
          {/* Tăng z-index */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Sửa thông tin khách hàng</h3>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {" "}
                <X size={20} />{" "}
              </button>
            </div>
            {formError && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-900/30 p-2 rounded text-center">
                {formError}
              </p>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              {" "}
              {/* Tăng space */}
              <div>
                <label className="label-style">Tên khách hàng *</label>
                <input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  className="input-style"
                  required
                />
              </div>
              <div>
                <label className="label-style">Địa chỉ</label>
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="input-style"
                />
              </div>
              <div>
                <label className="label-style">Email (Không thể sửa)</label>
                <input
                  value={form.email}
                  className="input-style bg-gray-100 dark:bg-slate-700 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="label-style">SĐT</label>
                <input
                  value={form.phone_number}
                  onChange={(e) =>
                    setForm({ ...form, phone_number: e.target.value })
                  }
                  className="input-style"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                {" "}
                {/* Tăng gap */}
                <button
                  type="button"
                  className="modal-button-secondary"
                  onClick={closeForm}
                >
                  {" "}
                  Hủy{" "}
                </button>
                <button type="submit" className="modal-button-primary">
                  {" "}
                  Lưu{" "}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteConfirm && selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
          {" "}
          {/* Tăng z-index */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
            <h4 className="text-lg font-semibold text-red-600 mb-3">
              {" "}
              Xác nhận xóa hồ sơ{" "}
            </h4>
            <p className="mb-4">
              Bạn có chắc muốn xóa hồ sơ của{" "}
              <b>{selectedCustomer.full_name || selectedCustomer.email}</b>?
              <br />
              <span className="text-sm text-orange-600 dark:text-orange-400">
                (Hành động này không xóa tài khoản đăng nhập.)
              </span>
            </p>
            <div className="flex justify-center gap-3">
              {" "}
              {/* Tăng gap */}
              <button
                className="modal-button-secondary"
                onClick={closeDeleteConfirm}
              >
                {" "}
                Hủy{" "}
              </button>
              <button
                className="modal-button-danger"
                onClick={handleDelete}
              >
                {" "}
                Xóa hồ sơ{" "}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CSS --- */}
      <style jsx>{`
        .th-style {
          @apply px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider;
        }
        .td-style {
          @apply px-4 py-3 text-sm text-gray-600 dark:text-gray-300;
        }
        .action-button {
          @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed;
        }
        .pagination-arrow {
          @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
        }
        .pagination-number {
          @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed;
        }
        .pagination-active {
          @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600;
        }
        .pagination-dots {
          @apply px-2 py-1 text-gray-500 dark:text-gray-400;
        }
        /* Modal styles */
        .input-style {
          @apply border border-gray-300 dark:border-slate-600 p-2 rounded-md w-full dark:bg-slate-700 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition;
        }
        .label-style {
          @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1;
        }
        .modal-button-secondary {
          @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm transition-colors;
        }
        .modal-button-primary {
          @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm transition-colors;
        }
        .modal-button-danger {
          @apply px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm transition-colors;
        }
      `}</style>
    </div>
  );
}