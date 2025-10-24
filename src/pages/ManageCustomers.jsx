// ManageCustomersSupabase.jsx
// (FIXED: Sửa tên bảng thành "Users" và cập nhật tên cột cho khớp CSDL)

import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa"; // Thêm FaEdit, FaTrash
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast'; // <<< Thêm toast

const supabase = getSupabase();

export default function ManageCustomersSupabase() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5); // Giữ nguyên pageSize nếu muốn
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Lưu trữ user đang sửa/xóa
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // <<< SỬA: State form dùng tên cột mới >>>
  const [form, setForm] = useState({ full_name: "", address: "", email: "", phone_number: "" });
  const [formError, setFormError] = useState("");

  // Fetch customers with pagination
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // <<< SỬA: Đổi tên bảng thành "Users" >>>
      let query = supabase
        .from("Users")
        .select("*", { count: "exact" })
        // <<< SỬA: Sắp xếp theo cột tồn tại, ví dụ full_name >>>
        .order("full_name", { ascending: true })
        .range(from, to);

      if (search.trim() !== "") {
        // <<< SỬA: Đổi tên bảng và cột tìm kiếm >>>
        query = supabase
          .from("Users")
          .select("*", { count: "exact" })
          // Tìm kiếm trên nhiều cột hơn
          .or(`full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,phone_number.ilike.%${search.trim()}%`)
          .order("full_name", { ascending: true })
          .range(from, to);
      }

      const { data, count, error } = await query;
      if (error) throw error;
      setCustomers(data || []);
      setTotalPages(Math.ceil(count / pageSize) || 1);
    } catch (err) {
      console.error("Lỗi tải danh sách khách hàng:", err);
      // <<< SỬA: Dùng toast thay alert >>>
      toast.error(`Không thể tải dữ liệu khách hàng: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // Chỉ fetch lại khi đổi trang

  // --- Form ---
  const openForm = (customer = null) => {
    setFormError("");
    if (customer) {
      setSelectedCustomer(customer);
      // <<< SỬA: Dùng tên cột mới >>>
      setForm({
        full_name: customer.full_name || '',
        address: customer.address || '',
        email: customer.email || '', // Email thường không nên cho sửa ở đây
        phone_number: customer.phone_number || '',
      });
    } else {
      setSelectedCustomer(null);
      // <<< SỬA: Dùng tên cột mới >>>
      setForm({ full_name: "", address: "", email: "", phone_number: "" });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedCustomer(null); // Reset selected customer khi đóng form
    setForm({ full_name: "", address: "", email: "", phone_number: "" }); // Reset form về rỗng
    setFormError(""); // Xóa lỗi form
  };

  const validateForm = () => {
    // <<< SỬA: Dùng tên cột mới >>>
    if (!form.full_name?.trim()) return "Tên không được trống.";
    // Bỏ validate bắt buộc cho các trường khác nếu cần
    // if (!form.address?.trim()) return "Địa chỉ không được trống.";
    // if (!form.email?.trim()) return "Email không được trống.";
    // if (!form.phone_number?.trim()) return "Số điện thoại không được trống.";
    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) {
        setFormError(err);
        return;
    }
    setFormError(""); // Xóa lỗi nếu validate thành công
    try {
      // <<< SỬA: Tạo object update với tên cột đúng >>>
      const updateData = {
          full_name: form.full_name,
          address: form.address,
          // Email thường không nên cập nhật trực tiếp ở đây, nó liên quan đến Auth
          phone_number: form.phone_number,
      };

      if (selectedCustomer) {
        // <<< SỬA: Update bảng "Users" theo "id" >>>
        const { error } = await supabase
          .from("Users")
          .update(updateData)
          .eq("id", selectedCustomer.id); // Dùng cột 'id'
         if (error) throw error;
         toast.success("Cập nhật khách hàng thành công!");
      } else {
        // <<< LƯU Ý: Thêm mới user nên thực hiện qua Supabase Auth (Signup) >>>
        // Đoạn code insert này sẽ tạo record trong 'Users' nhưng không tạo tài khoản Auth
        // Nếu bạn muốn tạo user mới hoàn chỉnh, cần gọi hàm signup của Supabase Auth trước
        toast.warn("Chức năng thêm mới nên được thực hiện qua Đăng ký tài khoản.");
        // const { error } = await supabase.from("Users").insert(updateData); // Tạm ẩn
        // if (error) throw error;
        // toast.success("Thêm khách hàng thành công! (Chưa có tài khoản đăng nhập)");
      }
      fetchCustomers(); // Tải lại danh sách
      closeForm();    // Đóng form
    } catch (err) {
      console.error("Lỗi lưu:", err);
      // <<< SỬA: Hiển thị lỗi cụ thể hơn >>>
      setFormError(`Không thể lưu dữ liệu: ${err.message}`);
      toast.error(`Lỗi lưu: ${err.message}`);
    }
  };

  // --- Delete ---
  const openDeleteConfirm = (c) => {
    setSelectedCustomer(c);
    setShowDeleteConfirm(true);
  };
  const closeDeleteConfirm = () => {
      setSelectedCustomer(null); // Reset selected customer khi đóng confirm
      setShowDeleteConfirm(false);
  }

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      // <<< SỬA: Xóa từ bảng "Users" theo "id" >>>
      // Lưu ý: Thao tác này chỉ xóa profile trong bảng Users, không xóa tài khoản trong Auth.
      // Để xóa hoàn toàn user, cần gọi hàm xóa user của Supabase Auth Admin API (cần quyền admin)
      const { error } = await supabase.from("Users").delete().eq("id", selectedCustomer.id);
      if (error) throw error;
      toast.success(`Đã xóa hồ sơ "${selectedCustomer.full_name}"!`);
      fetchCustomers(); // Tải lại danh sách
      closeDeleteConfirm(); // Đóng confirm
    } catch (err) {
      console.error("Lỗi xóa:", err);
      toast.error(`Xóa thất bại: ${err.message}`);
    }
  };

  // --- Pagination controls (Giữ nguyên) ---
  const handlePrev = () => setPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages));

  // Kích hoạt tìm kiếm khi nhấn Enter hoặc nút Search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset về trang 1 khi tìm kiếm
    fetchCustomers();
  };
  // Tự động tìm kiếm khi người dùng ngừng gõ (debounce)
   useEffect(() => {
     const handler = setTimeout(() => {
       setPage(1); // Reset về trang 1
       fetchCustomers();
     }, 500); // Đợi 500ms sau khi ngừng gõ
     return () => clearTimeout(handler); // Hủy timeout nếu gõ tiếp
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [search]); // Chỉ chạy khi search thay đổi

  return (
    <div className="p-4 sm:p-6 dark:bg-slate-900 dark:text-white min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Quản lý Khách hàng (Users)</h2>

      {/* --- Thanh tìm kiếm + thêm --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        {/* <<< SỬA: Form tìm kiếm với debounce, không cần nút submit >>> */}
        <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
           <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input
             type="text"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Tìm tên, email, SĐT..."
             className="border rounded-md p-2 pl-10 w-full sm:w-72 dark:bg-slate-700 dark:border-slate-600"
           />
        </div>
        {/* <<< Tạm ẩn nút Thêm vì logic thêm user phức tạp hơn >>>
        <button
          onClick={() => openForm()}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center gap-1 w-full sm:w-auto justify-center"
        >
          <FaPlus /> Thêm khách hàng (Tạm ẩn)
        </button> */}
      </div>

      {/* --- Bảng dữ liệu --- */}
      <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-md rounded-lg border dark:border-slate-700">
        <table className="w-full border-collapse min-w-[600px]">
          <thead className="bg-gray-100 dark:bg-slate-700">
            <tr>
              <th className="p-3 border dark:border-slate-600 text-left text-xs uppercase font-semibold">#</th>
              {/* <<< SỬA: Tên cột >>> */}
              <th className="p-3 border dark:border-slate-600 text-left text-xs uppercase font-semibold">Tên</th>
              <th className="p-3 border dark:border-slate-600 text-left text-xs uppercase font-semibold">Email</th>
              <th className="p-3 border dark:border-slate-600 text-left text-xs uppercase font-semibold">Địa chỉ</th>
              <th className="p-3 border dark:border-slate-600 text-left text-xs uppercase font-semibold">SĐT</th>
              <th className="p-3 border dark:border-slate-600 text-center text-xs uppercase font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500 dark:text-gray-400">
                  Đang tải...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500 dark:text-gray-400 italic">
                  {search ? "Không tìm thấy khách hàng." : "Chưa có dữ liệu."}
                </td>
              </tr>
            ) : (
              customers.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 text-sm">
                  {/* <<< SỬA: Tên cột >>> */}
                  <td className="p-2 border dark:border-slate-600 text-center text-gray-500">{(page - 1) * pageSize + i + 1}</td>
                  <td className="p-2 border dark:border-slate-600 font-medium">{c.full_name || <i className="text-gray-400">Chưa có</i>}</td>
                  <td className="p-2 border dark:border-slate-600">{c.email}</td>
                  <td className="p-2 border dark:border-slate-600">{c.address || <i className="text-gray-400">Chưa có</i>}</td>
                  <td className="p-2 border dark:border-slate-600">{c.phone_number || <i className="text-gray-400">Chưa có</i>}</td>
                  <td className="p-2 border dark:border-slate-600 text-center whitespace-nowrap">
                    <button
                      onClick={() => openForm(c)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 mr-1"
                      title="Sửa"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(c)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                      title="Xóa hồ sơ"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Phân trang --- */}
       {!loading && totalItems > pageSize && (
         <div className="flex justify-center items-center mt-4 gap-2 text-sm">
             <button
                 onClick={handlePrev}
                 disabled={page === 1 || loading}
                 className="px-3 py-1 bg-gray-200 dark:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
             >
                 Trang trước
             </button>
             {/* Hiển thị số trang linh hoạt hơn nếu cần */}
             <span className="font-semibold">{page} / {totalPages}</span>
             <button
                 onClick={handleNext}
                 disabled={page === totalPages || loading}
                 className="px-3 py-1 bg-gray-200 dark:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
             >
                 Trang tiếp
             </button>
         </div>
       )}


      {/* --- Modal form --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-center mb-4">
              {selectedCustomer ? "Sửa thông tin khách hàng" : "Thêm khách hàng (Chỉ hồ sơ)"}
            </h3>
            {formError && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-900/30 p-2 rounded text-center">{formError}</p>
            )}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm mb-1 font-medium">Tên khách hàng *</label>
                {/* <<< SỬA: Dùng tên cột mới >>> */}
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="border dark:border-slate-600 p-2 rounded w-full dark:bg-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium">Địa chỉ</label>
                {/* <<< SỬA: Dùng tên cột mới >>> */}
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="border dark:border-slate-600 p-2 rounded w-full dark:bg-slate-700"
                />
              </div>

               {/* Email nên được quản lý qua Auth, chỉ hiển thị */}
               <div>
                  <label className="block text-sm mb-1 font-medium">Email (Không thể sửa)</label>
                  <input
                      value={form.email}
                      className="border dark:border-slate-600 p-2 rounded w-full dark:bg-slate-700 bg-gray-100 dark:bg-slate-600 cursor-not-allowed"
                      disabled
                  />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium">SĐT</label>
                {/* <<< SỬA: Dùng tên cột mới >>> */}
                <input
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  className="border dark:border-slate-600 p-2 rounded w-full dark:bg-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  className="bg-gray-300 dark:bg-slate-600 px-4 py-2 rounded font-semibold hover:bg-gray-400 dark:hover:bg-slate-500"
                  onClick={closeForm}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
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
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
            <h4 className="text-lg font-semibold text-red-600 mb-3">
              Xác nhận xóa hồ sơ
            </h4>
            <p className="mb-4">
              Bạn có chắc muốn xóa hồ sơ của khách hàng{" "}
              {/* <<< SỬA: Dùng tên cột mới >>> */}
              <b>{selectedCustomer.full_name || selectedCustomer.email}</b>?
              <br/>
              <span className="text-sm text-orange-600 dark:text-orange-400">(Hành động này không xóa tài khoản đăng nhập.)</span>
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="bg-gray-300 dark:bg-slate-600 px-4 py-2 rounded font-semibold hover:bg-gray-400 dark:hover:bg-slate-500"
                onClick={closeDeleteConfirm}
              >
                Hủy
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
                onClick={handleDelete}
              >
                Xóa hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}