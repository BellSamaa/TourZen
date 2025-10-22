import React, { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { FaSpinner, FaPlus } from "react-icons/fa";
import { Buildings } from "@phosphor-icons/react"; // Thêm icon tiêu đề

const supabase = getSupabase();

// --- Component Modal để Thêm Mới ---
const AddSupplierModal = ({ show, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("hotel");
  const [submitting, setSubmitting] = useState(false);

  // --- MỚI: State để chứa user và user được chọn ---
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  // --- MỚI: Fetch các user có role 'supplier' khi modal mở ---
  useEffect(() => {
    async function fetchSupplierUsers() {
      if (show) {
        setLoadingUsers(true);
        // Lấy tất cả user có role là 'supplier'
        const { data, error } = await supabase
          .from("Users")
          .select("id, full_name, email")
          .eq("role", "supplier")
          .order("full_name", { ascending: true });

        if (error) {
          alert("Lỗi tải danh sách user: " + error.message);
        } else {
          // Lọc ra những user chưa được liên kết (nếu cần, nhưng đơn giản là cứ hiển thị)
          setUsers(data || []);
        }
        setLoadingUsers(false);
      }
    }
    fetchSupplierUsers();
  }, [show]); // Chạy lại mỗi khi modal được mở

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- 👇 ĐÂY LÀ CODE ĐƯỢC THÊM VÀO 👇 ---
    // Kiểm tra xem user đã chọn tài khoản liên kết chưa
    if (!selectedUserId || selectedUserId === "") {
      alert("Bạn phải chọn một tài khoản để liên kết!");
      return; // Dừng lại, không cho submit
    }
    // --- ------------------------------------ ---

    setSubmitting(true);
    
    // --- SỬA: Thêm 'user_id' vào lúc insert ---
    const { error } = await supabase.from("Suppliers").insert({
      name: name,
      email: email,
      phone: phone,
      service_type: serviceType,
      user_id: selectedUserId, // <-- Đây là khóa ngoại liên kết
    });

    if (error) {
      // Báo lỗi nếu user này đã được link rồi (lỗi unique)
      if (error.code === '23505') { 
         alert("Lỗi: Tài khoản này đã được liên kết với một nhà cung cấp khác.");
      } else {
         alert("Lỗi thêm nhà cung cấp: " + error.message);
      }
    } else {
      alert("Thêm và liên kết thành công!");
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setServiceType("hotel");
      setSelectedUserId(""); // <-- Reset user đã chọn
      
      onSuccess();
      onClose();
    }
    setSubmitting(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Thêm Nhà Cung Cấp Mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Các input Tên, Email, SĐT... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên nhà cung cấp (Tên công ty/brand)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-neutral-700 dark:border-gray-600 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email liên hệ</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-neutral-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-neutral-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loại dịch vụ</label>
            <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-neutral-700 dark:border-gray-600 dark:text-white" >
              <option value="hotel">Khách sạn</option>
              <option value="flight">Chuyến bay</option>
              <option value="car_rental">Thuê xe</option>
              <option value="restaurant">Nhà hàng</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* --- MỚI: Thêm Dropdown để LIÊN KẾT USER --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Liên kết với Tài khoản (User)
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-neutral-700 dark:border-gray-600 dark:text-white"
              required // Bắt buộc phải chọn 1 user để liên kết
            >
              <option value="">-- Chọn tài khoản để liên kết --</option>
              {loadingUsers ? (
                <option disabled>Đang tải user...</option>
              ) : (
                users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </option>
                ))
              )}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Chỉ hiển thị các tài khoản có vai trò 'supplier'.
            </p>
          </div>
          {/* ------------------------------------------- */}

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400" >
              Hủy
            </button>
            <button type="submit" disabled={submitting || loadingUsers} className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50" >
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Component Trang Chính ---
export default function ManageSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Hàm fetch dữ liệu
  async function fetchSuppliers() {
    setLoading(true);
    setError(null);
    
    // --- SỬA: Dùng 'join' để lấy thông tin user liên kết ---
    const { data, error } = await supabase
      .from("Suppliers")
      // Lấy tất cả cột từ Suppliers, và 2 cột từ bảng Users
      .select("*, Users(full_name, email)"); 

    if (error) {
      console.error("Lỗi fetch nhà cung cấp:", error);
      setError(error.message);
    } else {
      setSuppliers(data);
    }
    setLoading(false);
  }

  // Chạy hàm fetch khi component được tải
  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-sky-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Lỗi: {error}</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <Buildings size={28} weight="duotone" className="text-blue-600" />
          Quản lý Nhà Cung Cấp
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
        >
          <FaPlus />
          <span>Thêm Mới</span>
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tên NCC (Brand)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Loại Dịch Vụ
                </th>
                {/* --- MỚI: Thêm cột Tài khoản --- */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tài khoản liên kết
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {supplier.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {supplier.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {supplier.service_type}
                  </td>
                  {/* --- MỚI: Hiển thị user đã liên kết --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {supplier.Users ? (
                      // Nếu có liên kết (Users không phải null)
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {supplier.Users.full_name || supplier.Users.email}
                      </span>
                    ) : (
                      // Nếu user_id là null
                      <span className="italic text-red-500">Chưa liên kết</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddSupplierModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          // Khi thêm thành công, fetch lại danh sách
          fetchSuppliers();
        }}
      />
    </div>
  );
}

