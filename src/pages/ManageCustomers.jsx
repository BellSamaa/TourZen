// src/pages/ManageCustomers.jsx
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

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

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
      customers.map((c) =>
        c.id === customerId ? { ...c, role: newRole } : c
      )
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

  // --- Bộ lọc & tìm kiếm ---
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase());
      const matchRole =
        filterRole === "all" ? true : c.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [customers, search, filterRole]);

  // --- Loading ---
  if (loading && customers.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center p-24 text-center">
        <FaSpinner className="animate-spin text-sky-500" size={40} />
        <p className="text-slate-500 mt-3 font-medium">
          Đang tải danh sách khách hàng...
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
          Quản lý tài khoản & khách hàng
        </h1>
      </div>

      {/* --- Thanh tìm kiếm và lọc --- */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-gray-200 dark:border-slate-700">
        <div className="relative flex-1 min-w-[250px]">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
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
        </div>
      </div>

      {/* --- Bảng khách hàng --- */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
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
              return (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {c.full_name || (
                      <span className="italic text-gray-400">Chưa cập nhật</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {c.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {role.icon}
                      <select
                        value={c.role}
                        onChange={(e) =>
                          handleRoleChange(c.id, c.role, e.target.value)
                        }
                        className={`rounded-lg px-2 py-1 text-sm border-none focus:ring-2 focus:ring-sky-400 transition ${role.badge}`}
                      >
                        <option value="user">User</option>
                        <option value="supplier">Supplier</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() =>
                        handleDeleteUser(c.id, c.full_name || c.email)
                      }
                      className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                      title="Xóa người dùng"
                    >
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
            Không có khách hàng nào phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
}
