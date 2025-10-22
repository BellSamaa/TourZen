// src/pages/ManageSuppliers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash, CircleNotch, X, UserCircle } from '@phosphor-icons/react';

const supabase = getSupabase();

const initialFormData = {
  name: '',
  user_id: '',
};

export default function ManageSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null); 

  // --- BẮT ĐẦU SỬA ---
  // Hàm tải danh sách Users (Đã thêm DEBUG LOG)
  const fetchUsers = async () => {
    console.log("DEBUG: Bắt đầu gọi fetchUsers..."); // Log 1

    // ĐẢM BẢO TÊN BẢNG 'Users' LÀ CHÍNH XÁC
    const { data, error } = await supabase
        .from('Users') // <-- KIỂM TRA LẠI TÊN BẢNG NÀY (có phải là 'profiles'?)
        .select('user_id, full_name, email, role');
    
    if (error) {
        toast.error('Lỗi tải danh sách người dùng! (Xem console F12)');
        
        // Đây là phần quan trọng nhất:
        console.error("DEBUG: LỖI THẬT SỰ TỪ SUPABASE (fetchUsers):", error); 
    
    } else {
        // Log này sẽ cho biết data có về hay không
        console.log("DEBUG: Fetch users thành công, data trả về:", data); // Log 2
        setUsers(data || []);
    }
  };
  // --- KẾT THÚC SỬA ---

  // Hàm tải danh sách NCC
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Suppliers')
      .select('*, Users(full_name, email)') 
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Lỗi tải danh sách nhà cung cấp!');
      console.error("Fetch Suppliers Error:", error);
    } else {
      setSuppliers(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSuppliers();
    fetchUsers();
  }, [fetchSuppliers]);

  // Mở modal (Giữ nguyên)
  const handleOpenModal = (supplier = null) => {
    if (supplier) { // Chế độ sửa
      setFormData({
        name: supplier.name,
        user_id: supplier.user_id || '', 
      });
      setEditingId(supplier.id);
    } else { // Chế độ thêm mới
      setFormData(initialFormData);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  // Đóng modal (Giữ nguyên)
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData); 
    setEditingId(null);
  };

  // Xử lý thay đổi input (Giữ nguyên)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý submit (ĐÃ BỎ `approval_status`)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
        toast.error('Vui lòng nhập Tên Nhà cung cấp.');
        return;
    }
    setIsSubmitting(true);
    let error;

    const dataToSubmit = {
        name: formData.name,
        user_id: formData.user_id === '' ? null : formData.user_id, 
    };

    if (editingId) { // Cập nhật NCC (Cần RLS Policy 'UPDATE')
      const { error: updateError } = await supabase
        .from('Suppliers')
        .update(dataToSubmit)
        .eq('id', editingId);
      error = updateError;
    } else { // Thêm NCC mới (Cần RLS Policy 'INSERT')
      const { error: insertError } = await supabase
        .from('Suppliers')
        .insert(dataToSubmit);
      error = insertError;
    }

    if (error) {
      toast.error("Có lỗi xảy ra: " + error.message);
      console.error("Lỗi Submit:", error);
    } else {
      toast.success(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      handleCloseModal(); 
      await fetchSuppliers(); 
    }
    setIsSubmitting(false);
  };

  // Xử lý xóa NCC (Giữ nguyên)
  const handleDelete = async (supplierId, supplierName) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhà cung cấp "${supplierName}" không?`)) {
      const { error } = await supabase
        .from('Suppliers')
        .delete()
        .eq('id', supplierId);

      if (error) {
        toast.error("Lỗi khi xóa: " + error.message);
      } else {
        toast.success('Xóa thành công!');
        await fetchSuppliers(); 
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 bg-neutral-50 dark:bg-neutral-950 min-h-screen text-neutral-800 dark:text-neutral-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Quản lý Nhà cung cấp
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Thêm Nhà cung cấp
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <CircleNotch size={32} className="animate-spin text-sky-500" />
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg overflow-x-auto border dark:border-neutral-700">
          <table className="w-full min-w-max text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
              <tr>
                <th scope="col" className="px-6 py-3">Tên</th>
                <th scope="col" className="px-6 py-3">Tài khoản liên kết</th>
                <th scope="col" className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-neutral-700">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                  <td className="px-6 py-4 font-medium whitespace-nowDrap">{supplier.name}</td>
                  <td className="px-6 py-4">
                      {supplier.Users ? (
                          <div className='flex items-center gap-1.5' title={supplier.Users.email}>
                              <UserCircle size={16} className="text-neutral-500" />
                              <span className='font-medium'>{supplier.Users.full_name}</span>
                          </div>
                      ) : (
                          <span className="text-xs italic text-neutral-500">Chưa liên kết</span>
                          )}
                  </td>
                  <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    <button onClick={() => handleOpenModal(supplier)} className="p-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400" title="Sửa">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(supplier.id, supplier.name)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400" title="Xóa">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                    <td colSpan="3" className="text-center py-10 text-neutral-500 italic">Chưa có nhà cung cấp nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form (Giữ nguyên) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-transform duration-300 scale-100">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-800 z-10">
                <h3 className="text-xl font-semibold">
                  {editingId ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}
                </h3>
                <button type="button" onClick={handleCloseModal} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 gap-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tên Nhà cung cấp *</label>
                  <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="user_id" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tài khoản liên kết</label>
                    <select 
                        id="user_id" 
                        name="user_id" 
                        value={formData.user_id} 
                        onChange={handleChange} 
                        className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
                    >
                        <option value="">[Không liên kết]</option>
                        {users.map(user => (
                        <option key={user.user_id} value={user.user_id}>
                            {user.full_name || user.email} ({user.role || 'user'})
                        </option>
                        ))}
                    </select>
                </div>
              </div>

              <div className="p-4 border-t dark:border-neutral-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-neutral-800 z-10">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100">
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <CircleNotch size={20} className="animate-spin" />}
                  {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}