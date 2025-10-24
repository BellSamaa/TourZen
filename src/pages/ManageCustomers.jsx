// ManageCustomersSupabase.jsx
import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import { getSupabase } from "../lib/supabaseClient";

const supabase = getSupabase();

export default function ManageCustomersSupabase() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({ TenKH: "", DiaChi: "", Email: "", SDT: "" });
  const [formError, setFormError] = useState("");

  // Fetch customers with pagination
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("KhachHang")
        .select("*", { count: "exact" })
        .order("MaKH", { ascending: true })
        .range(from, to);

      if (search.trim() !== "") {
        query = supabase
          .from("KhachHang")
          .select("*", { count: "exact" })
          .ilike("TenKH", `%${search.trim()}%`)
          .order("MaKH", { ascending: true })
          .range(from, to);
      }

      const { data, count, error } = await query;
      if (error) throw error;
      setCustomers(data || []);
      setTotalPages(Math.ceil(count / pageSize) || 1);
    } catch (err) {
      console.error("Lỗi tải danh sách khách hàng:", err);
      alert("Không thể tải dữ liệu khách hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  // --- Form ---
  const openForm = (customer = null) => {
    setFormError("");
    if (customer) {
      setSelectedCustomer(customer);
      setForm({
        TenKH: customer.TenKH,
        DiaChi: customer.DiaChi,
        Email: customer.Email,
        SDT: customer.SDT,
      });
    } else {
      setSelectedCustomer(null);
      setForm({ TenKH: "", DiaChi: "", Email: "", SDT: "" });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedCustomer(null);
  };

  const validateForm = () => {
    if (!form.TenKH.trim()) return "Tên không được trống.";
    if (!form.DiaChi.trim()) return "Địa chỉ không được trống.";
    if (!form.Email.trim()) return "Email không được trống.";
    if (!form.SDT.trim()) return "Số điện thoại không được trống.";
    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) return setFormError(err);
    try {
      if (selectedCustomer) {
        await supabase
          .from("KhachHang")
          .update(form)
          .eq("MaKH", selectedCustomer.MaKH);
      } else {
        await supabase.from("KhachHang").insert(form);
      }
      fetchCustomers();
      closeForm();
    } catch (err) {
      console.error("Lỗi lưu:", err);
      setFormError("Không thể lưu dữ liệu.");
    }
  };

  // --- Delete ---
  const openDeleteConfirm = (c) => {
    setSelectedCustomer(c);
    setShowDeleteConfirm(true);
  };
  const closeDeleteConfirm = () => setShowDeleteConfirm(false);

  const handleDelete = async () => {
    try {
      await supabase.from("KhachHang").delete().eq("MaKH", selectedCustomer.MaKH);
      fetchCustomers();
      closeDeleteConfirm();
    } catch (err) {
      alert("Xóa thất bại: " + err.message);
    }
  };

  // --- Pagination controls ---
  const handlePrev = () => setPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages));

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Khách hàng</h2>

      {/* --- Thanh tìm kiếm + thêm --- */}
      <div className="flex items-center mb-4">
        <form onSubmit={handleSearch} className="flex items-stretch">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nhập tên khách hàng..."
            className="border rounded-l-md p-2 w-64"
          />
          <button
            type="submit"
            className="bg-sky-600 text-white px-3 py-2 rounded-r-md"
          >
            <FaSearch />
          </button>
        </form>
        <button
          onClick={() => openForm()}
          className="ml-4 bg-green-600 text-white px-3 py-2 rounded flex items-center gap-1"
        >
          <FaPlus /> Thêm khách hàng
        </button>
      </div>

      {/* --- Bảng dữ liệu --- */}
      <div className="overflow-x-auto bg-white shadow-md rounded">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border text-left">#</th>
              <th className="p-3 border text-left">Tên người đặt</th>
              <th className="p-3 border text-left">Địa chỉ</th>
              <th className="p-3 border text-left">Email</th>
              <th className="p-3 border text-left">SĐT</th>
              <th className="p-3 border text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500 italic">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              customers.map((c, i) => (
                <tr key={c.MaKH} className="hover:bg-gray-50">
                  <td className="p-2 border text-center">{(page - 1) * pageSize + i + 1}</td>
                  <td className="p-2 border">{c.TenKH}</td>
                  <td className="p-2 border">{c.DiaChi}</td>
                  <td className="p-2 border">{c.Email}</td>
                  <td className="p-2 border">{c.SDT}</td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => openForm(c)}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(c)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Phân trang --- */}
      <div className="flex justify-center items-center mt-4 gap-2">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Trang trước
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${
              page === i + 1
                ? "bg-sky-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Trang tiếp
        </button>
      </div>

      {/* --- Modal form --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-[400px]">
            <h3 className="text-lg font-semibold text-center mb-4">
              {selectedCustomer ? "Sửa khách hàng" : "Thêm khách hàng"}
            </h3>
            {formError && (
              <p className="text-sm text-red-600 mb-3">{formError}</p>
            )}
            <form onSubmit={handleSave}>
              <label className="block text-sm mb-1">Tên khách hàng</label>
              <input
                value={form.TenKH}
                onChange={(e) => setForm({ ...form, TenKH: e.target.value })}
                className="border p-2 rounded w-full mb-3"
              />

              <label className="block text-sm mb-1">Địa chỉ</label>
              <input
                value={form.DiaChi}
                onChange={(e) => setForm({ ...form, DiaChi: e.target.value })}
                className="border p-2 rounded w-full mb-3"
              />

              <label className="block text-sm mb-1">Email</label>
              <input
                value={form.Email}
                onChange={(e) => setForm({ ...form, Email: e.target.value })}
                className="border p-2 rounded w-full mb-3"
              />

              <label className="block text-sm mb-1">SĐT</label>
              <input
                value={form.SDT}
                onChange={(e) => setForm({ ...form, SDT: e.target.value })}
                className="border p-2 rounded w-full mb-4"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-gray-300 px-3 py-1 rounded"
                  onClick={closeForm}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal xác nhận xóa --- */}
      {showDeleteConfirm && selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-[360px] text-center">
            <h4 className="text-lg font-semibold text-red-600 mb-3">
              Xác nhận xóa
            </h4>
            <p className="mb-4">
              Bạn có chắc muốn xóa khách hàng{" "}
              <b>{selectedCustomer.TenKH}</b> không?
            </p>
            <div className="flex justify-center gap-2">
              <button
                className="bg-gray-300 px-3 py-1 rounded"
                onClick={closeDeleteConfirm}
              >
                Hủy
              </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={handleDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
