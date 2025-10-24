// src/pages/ManageAccounts.jsx
// (Nội dung file ManageCustomers.jsx mới của bạn)
import React, { useState, useEffect, useMemo } from "react";
import { getSupabase } from "../lib/supabaseClient";
import {
  FaSpinner,
  FaUsers,
  FaUserCog,
  FaBuilding,
  FaTrash,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { UserList } from "@phosphor-icons/react";

const supabase = getSupabase();

// --- Badge + Icon theo vai trò ---
const getRoleStyle = (role) => {
  switch (role) {
    case "admin":
      return {
        label: "Admin",
        icon: <FaUserCog className="text-red-500" />,
        badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      };
    case "supplier":
      return {
        label: "Supplier",
        icon: <FaBuilding className="text-blue-500" />,
        badge:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      };
    case "user":
    default:
      return {
        label: "User",
        icon: <FaUsers className="text-green-500" />,
        badge:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      };
  }
};

export default function ManageAccounts() { // <<< Đổi tên component
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterActive, setFilterActive] = useState("all"); // all | active | inactive

  async function fetchCustomers() {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("Users")
      .select("*")
      .order("full_name", { ascending: true });

    if (fetchError) {
      console.error("Lỗi fetch khách hàng:", fetchError);
      setError("Không thể tải danh sách khách hàng: " + fetchError.message);
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleRoleChange = async (customerId, currentRole, newRole) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn đổi vai trò từ '${currentRole}' thành '${newRole}'?`
      )
    ) {
      setCustomers(
        customers.map((c) =>
          c.id === customerId ? { ...c, role: currentRole } : c
        )
      );
      return;
    }

    setCustomers(
      customers.map((c) => (c.id === customerId ? { ...c, role: newRole } : c))
    );

    const { error } = await supabase
      .from("Users")
      .update({ role: newRole })
      .eq("id", customerId);

    if (error) {
      alert("Lỗi cập nhật vai trò: " + error.message);
      fetchCustomers();
    } else {
      alert("Cập nhật vai trò thành công!");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `XÓA HỒ SƠ NGƯỜI DÙNG?\nBạn có chắc muốn xóa "${userName}"?\n(Hành động này chỉ xóa hồ sơ, không xóa tài khoản đăng nhập.)`
      )
    )
      return;

    setLoading(true);
    const { error: deleteProfileError } = await supabase
      .from("Users")
      .delete()
      .eq("id", userId);

    if (deleteProfileError) {
      alert("Lỗi khi xóa hồ sơ: " + deleteProfileError.message);
    } else {
      alert(`Đã xóa hồ sơ người dùng "${userName}"!`);
      fetchCustomers();
    }
    setLoading(false);
  };

  // --- Chỉnh sửa hồ sơ (nhanh bằng prompt) ---
  const handleEditUser = async (user) => {
    const newName = prompt("Nhập tên mới:", user.full_name || "");
    const newAddress = prompt("Nhập địa chỉ mới:", user.address || "");
    const newPhone = prompt("Nhập số điện thoại mới:", user.phone_number || "");

    if (newName === null && newAddress === null && newPhone === null) return;

    const updates = {
      full_name: newName || user.full_name,
      address: newAddress || user.address,
      phone_number: newPhone || user.phone_number,
    };

    const { error } = await supabase
      .from("Users")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      alert("Lỗi khi cập nhật hồ sơ: " + error.message);
    } else {
      alert("Cập nhật hồ sơ thành công!");
      fetchCustomers();
    }
  };

  // --- Khóa / Mở khóa tài khoản ---
  const handleToggleActive = async (user) => {
    // Mặc định is_active là null hoặc true, nên !user.is_active sẽ thành false
    // Nếu user.is_active là false, !user.is_active sẽ thành true
    const next = user.is_active === false ? true : false; 
    const action = next ? "MỞ KHÓA" : "KHÓA";
    if (
      !window.confirm(`${action} tài khoản "${user.full_name || user.email}"?`)
    )
      return;

    // Optimistic UI
    setCustomers((prev) =>
      prev.map((c) => (c.id === user.id ? { ...c, is_active: next } : c))
    );

    const { error } = await supabase
      .from("Users")
      .update({ is_active: next })
      .eq("id", user.id);

    if (error) {
      alert("Lỗi cập nhật trạng thái: " + error.message);
      fetchCustomers(); // rollback
    } else {
      alert(`${action} tài khoản thành công!`);
    }
  };

  // --- Bộ lọc & tìm kiếm (mở rộng: address, phone_number, is_active) ---
  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) => {
      const matchSearch =
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.phone_number?.toLowerCase?.().includes(q) || 
        (typeof c.phone_number === "number" &&
          String(c.phone_number).includes(search));

      const matchRole = filterRole === "all" ? true : c.role === filterRole;

      const matchActive =
        filterActive === "all"
          ? true
          : filterActive === "active"
          ? c.is_active !== false // true hoặc undefined (dữ liệu cũ)
          : c.is_active === false; // inactive

      return matchSearch && matchRole && matchActive;
    });
  }, [customers, search, filterRole, filterActive]);

  // --- Loading ---
  if (loading && customers.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center p-24 text-center">
        <FaSpinner className="animate-spin text-sky-500" size={40} />
        <p className="text-slate-500 mt-3 font-medium">
          Đang tải danh sách tài khoản...
        </p>
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-6 rounded-xl text-center shadow-md">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* --- Tiêu đề --- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <UserList size={30} weight="duotone" className="text-sky-600" />
          Quản lý Tài khoản
        </h1>
      </div>

      {/* --- Thanh tìm kiếm và lọc --- */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-gray-200 dark:border-slate-700">
        <div className="relative flex-1 min-w-[250px]">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, địa chỉ hoặc SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="user">User</option>
            <option value="supplier">Supplier</option>
            <option value="admin">Admin</option>
          </select>

          {/* Lọc theo trạng thái */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa</option>
          </select>
        </div>
      </div>

      {/* --- Bảng khách hàng --- */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/40">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Tên đầy đủ
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Địa chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Vai trò
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Hành động
                </th>
                </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredCustomers.map((c) => {
                const role = getRoleStyle(c.role);
                const isLocked = c.is_active === false;
                return (
                    <tr
                    key={c.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isLocked ? "opacity-60 bg-red-50 dark:bg-red-900/10" : ""}`}
                    >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {c.full_name || <span className="italic text-gray-400">Chưa cập nhật</span>}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {c.email}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {c.address && c.address.trim() !== "" ? c.address : <span className="italic text-gray-400">Chưa có</span>}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {c.phone_number && String(c.phone_number).trim() !== "" ? String(c.phone_number) : <span className="italic text-gray-400">Chưa có</span>}
                    </td>

                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2">
                        {role.icon}
                        <select
                            value={c.role}
                            onChange={(e) => handleRoleChange(c.id, c.role, e.target.value)}
                            disabled={isLocked}
                            className={`rounded-lg px-2 py-1 text-sm border-none focus:ring-2 focus:ring-sky-400 transition ${role.badge} ${isLocked ? "cursor-not-allowed" : ""}`}
                        >
                            <option value="user">User</option>
                            <option value="supplier">Supplier</option>
                            <option value="admin">Admin</option>
                        </select>
                        </div>
                        {isLocked && (
                        <div className="text-xs text-amber-600 dark:text-amber-500 mt-1 font-semibold">Tài khoản đã bị khóa</div>
                        )}
                    </td>

                    <td className="px-6 py-4 text-right flex justify-end gap-2 whitespace-nowrap">
                        <button
                        onClick={() => handleEditUser(c)}
                        className="p-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-all rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        title="Chỉnh sửa thông tin người dùng"
                        type="button"
                        >
                        ✏️
                        </button>

                        <button
                        onClick={() => handleToggleActive(c)}
                        className={`p-2 rounded-lg transition-all hover:bg-slate-50 dark:hover:bg-slate-700/40 ${isLocked ? "text-amber-600 hover:text-amber-700" : "text-slate-600 hover:text-slate-800"}`}
                        title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                        type="button"
                        >
                        {isLocked ? "🔓" : "🔒"}
                        </button>

                        <button
                        onClick={() => handleDeleteUser(c.id, c.full_name || c.email)}
                        className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Xóa người dùng"
                        type="button"
                        >
                        <FaTrash size={16} />
                        </button>
                    </td>
                    </tr>
                );
                })}
            </tbody>
            </table>
         </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
            Không có tài khoản nào phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
}