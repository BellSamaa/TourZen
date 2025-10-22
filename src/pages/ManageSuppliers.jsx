import React, { useState, useEffect, useCallback } from "react";
// --- SỬA LỖI: Chuyển trở lại Supabase và dùng Key bạn cung cấp ---

// ------------------------------------------------
import { Loader2, Plus, Building } from "lucide-react"; // Giữ lại icon libraries

// --- KHỞI TẠO SUPABASE CLIENT ---
// Sử dụng thông tin bạn đã cung cấp
const supabaseUrl = "https://zdvwpjgpysxxqpvhovct.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdndwamdweXN4eHFwdmhvdmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjQzODUsImV4cCI6MjA3NjI0MDM4NX0.tmFvQDXSUdJlJKBuYoqvuJArZ5apYpb-eNQ90uYBJf0";

let supabase;
try {
  // Giả định 'window.supabase' được cung cấp bởi môi trường
  if (window.supabase) {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  } else {
    console.error("Supabase client not found on window object.");
  }
} catch (e) {
  console.error("Lỗi khởi tạo Supabase client:", e);
}
// ---------------------------------


// --- Component Modal để Thêm Mới ---
// SỬA: Xóa props db, appId. Component này sẽ dùng biến 'supabase' toàn cục
const AddSupplierModal = ({ show, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("hotel");
  const [submitting, setSubmitting] = useState(false);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  // --- SỬA: Fetch user từ Supabase ---
  useEffect(() => {
    async function fetchSupplierUsers() {
      // Chỉ fetch khi modal mở và supabase đã sẵn sàng
      if (show && supabase) {
        setLoadingUsers(true);
        try {
          // Lấy tất cả user có role là 'supplier'
          const { data, error } = await supabase
            .from("Users")
            .select("id, full_name, email")
            .eq("role", "supplier")
            .order("full_name", { ascending: true });

          if (error) {
            throw error;
          }
          
          setUsers(data || []);

        } catch (error) {
          alert("Lỗi tải danh sách user: " + error.message);
        }
        setLoadingUsers(false);
      }
    }
    fetchSupplierUsers();
  }, [show]); // Chạy lại mỗi khi modal được mở

  // --- SỬA: Submit dữ liệu lên Supabase ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!supabase) {
      alert("Lỗi: Kết nối cơ sở dữ liệu chưa sẵn sàng.");
      return;
    }

    if (!selectedUserId || selectedUserId === "") {
      alert("Bạn phải chọn một tài khoản để liên kết!");
      return;
    }
    
    setSubmitting(true);
    
    try {
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
           throw error;
         }
      } else {
        alert("Thêm và liên kết thành công!");
        // Reset form
        setName("");
        setEmail("");
        setPhone("");
        setServiceType("hotel");
        setSelectedUserId("");
        
        onSuccess(); // Gọi hàm fetch lại dữ liệu ở component cha
        onClose();
      }

    } catch (error) {
      alert("Lỗi thêm nhà cung cấp: " + error.message);
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

          {/* --- Dropdown để LIÊN KẾT USER (Không đổi) --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Liên kết với Tài khoản (User)
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-neutral-700 dark:border-gray-600 dark:text-white"
              required
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

  // --- SỬA: Xóa state của Firebase ---

  // --- SỬA: Kiểm tra Supabase khi component mount ---
  useEffect(() => {
    if (!supabase) {
      setError("Lỗi: Không thể khởi tạo Supabase client. 'window.supabase' không tồn tại.");
      setLoading(false);
    }
  }, []);

  // --- SỬA: Hàm fetch dữ liệu từ Supabase ---
  const fetchData = useCallback(async () => {
    if (!supabase) {
      // Đợi Supabase sẵn sàng
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Dùng cú pháp join rõ ràng (đã sửa ở lần trước)
      const { data, error } = await supabase
        .from("Suppliers")
        .select("*, Users:user_id(full_name, email)");

      if (error) {
        throw error;
      }
      
      setSuppliers(data);

    } catch (err) {
      console.error("Lỗi fetch dữ liệu:", err);
      setError(err.message);
    }
    setLoading(false);
  }, []); // Không còn phụ thuộc db, appId, userId

  // --- SỬA: Chạy hàm fetch khi Supabase sẵn sàng ---
  useEffect(() => {
    if (supabase) {
      fetchData();
    }
  }, [fetchData]); // Chạy lại khi hàm fetchData thay đổi


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-4xl text-sky-600" />
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
          <Building size={28} className="text-blue-600" />
          Quản lý Nhà Cung Cấp
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
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
                  <td className="px-6 py-4 whitespace-nowstatic/wave.png-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {supplier.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {supplier.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {supplier.service_type}
                  </td>
                  {/* --- Hiển thị user đã liên kết (Không đổi) --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {supplier.Users ? (
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {supplier.Users.full_name || supplier.Users.email}
                      </span>
                    ) : (
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
          fetchData(); 
        }}
        // --- SỬA: Không cần truyền props db, appId ---
      />
    </div>
  );
}

