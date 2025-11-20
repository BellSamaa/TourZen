// src/pages/ManageTransport.jsx
// (SỬA) Thêm tính năng Chỉnh sửa (Edit)
// (SỬA) Sửa lỗi logic state (flat vs nested details)

import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
// (SỬA) Thêm Pencil, X
import { PlusCircle, Trash, CircleNotch, CarSimple, WarningCircle, Pencil, X as CancelIcon } from "@phosphor-icons/react"; 

const supabase = getSupabase();
const productType = 'transport';

// (SỬA) State khởi tạo cho form (dùng nested details)
const initialFormData = {
  name: "",
  price: "",
  inventory: 99,
  details: {
      vehicle_type: "",
      seats: "",
  },
  code: "", // tour_code
};

// Helper hiển thị trạng thái
const ApprovalBadge = ({ status }) => {
    const base = "px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1";
    switch (status) {
        case "approved": return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}>Đã duyệt</span>;
        case "rejected": return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`}>Từ chối</span>;
        default: return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}>Đang chờ</span>;
    }
};

export default function ManageTransport() {
  const { user } = useAuth();
  const [supplierId, setSupplierId] = useState(null);
  const [transport, setTransport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  
  // (THÊM MỚI) State cho chỉnh sửa
  const [editingId, setEditingId] = useState(null);

  // Tìm Supplier ID từ User ID
  useEffect(() => {
    if (!user) return;
    const fetchSupplierLink = async () => {
        const { data, error } = await supabase
            .from('Suppliers')
            .select('id')
            .eq('user_id', user.id)
            .single();
        
        if (error) {
            console.error("Lỗi tìm nhà cung cấp:", error);
            toast.error("Tài khoản của bạn chưa được liên kết với Nhà cung cấp. Vui lòng liên hệ Admin.");
        } else if (data) {
            setSupplierId(data.id);
        }
    };
    fetchSupplierLink();
  }, [user]);

  // Tải danh sách xe từ Supabase
  const fetchTransport = useCallback(async () => {
    if (!supplierId) {
        setLoading(false);
        return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('Products')
      .select('*')
      .eq('product_type', productType)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Lỗi tải danh sách xe!');
    } else {
      setTransport(data || []);
      // Cảnh báo hết hàng
      const lowStock = data.filter(t => t.inventory <= 5);
      if (lowStock.length > 0) {
          toast.custom((t) => (
              <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-neutral-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10`}>
                  <div className="flex-1 w-0 p-4">
                      <div className="flex items-start">
                          <div className="flex-shrink-0 pt-0.5">
                              <WarningCircle size={24} className="text-yellow-500" />
                          </div>
                          <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Cảnh báo Tồn kho</p>
                              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                  Có {lowStock.length} xe/dịch vụ sắp hết hàng: {lowStock.map(t => t.name).join(', ')}.
                              </p>
                          </div>
                      </div>
                  </div>
                  <div className="flex border-l border-neutral-200 dark:border-neutral-700">
                      <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-sky-600 hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500">
                          Đóng
                      </button>
                  </div>
              </div>
          ), { duration: 6000, position: 'bottom-right' });
      }
    }
    setLoading(false);
  }, [supplierId]);

  useEffect(() => {
    fetchTransport();
  }, [fetchTransport]);

  // (SỬA) Xử lý thay đổi input (hỗ trợ nested details)
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name === 'name' || name === 'price' || name === 'inventory' || name === 'code') {
         let newValue = value;
         if ((name === 'price' || name === 'inventory') && type === 'number') {
             newValue = value === '' ? '' : parseInt(value) || 0; 
         }
         setFormData(prev => ({ ...prev, [name]: newValue }));
    } else {
        // Giả định các trường còn lại thuộc 'details'
         setFormData(prev => ({
            ...prev,
            details: {
                ...prev.details,
                [name]: (type === 'number') ? parseFloat(value) || 0 : value,
            }
        }));
    }
  };
  
  // (THÊM MỚI) Xử lý bấm nút Sửa
  const handleEditClick = (transportItem) => {
    setEditingId(transportItem.id);
    setFormData({
        name: transportItem.name,
        price: transportItem.price || '',
        inventory: transportItem.inventory ?? 99,
        details: transportItem.details || initialFormData.details,
        code: transportItem.tour_code || '' // Lấy tour_code gán vào code
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // (THÊM MỚI) Xử lý Hủy Sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormData);
  };

  // (SỬA) Gửi form (Thêm mới và Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId) {
        toast.error("Không thể thêm vì tài khoản chưa liên kết NCC.");
        return;
    }
    if (!formData.name || !formData.details.vehicle_type || !formData.price || !formData.code) {
        toast.error('Vui lòng nhập Tên xe, Loại xe, Giá và Mã dịch vụ.');
        return;
    }
    setIsSubmitting(true);
    
    let error;

    if (editingId) {
        // --- Chế độ CẬP NHẬT ---
        const dataToUpdate = {
            name: formData.name,
            price: formData.price === '' ? null : parseFloat(formData.price),
            inventory: formData.inventory,
            details: {
                vehicle_type: formData.details.vehicle_type,
                seats: formData.details.seats === '' ? null : parseInt(formData.details.seats)
            },
            tour_code: formData.code,
        };
        
        const { error: updateError } = await supabase
            .from('Products')
            .update(dataToUpdate)
            .eq('id', editingId)
            .eq('supplier_id', supplierId);
        error = updateError;

    } else {
        // --- Chế độ THÊM MỚI ---
        const dataToSubmit = {
            name: formData.name,
            product_type: productType,
            supplier_id: supplierId,
            price: formData.price === '' ? null : parseFloat(formData.price),
            details: {
                vehicle_type: formData.details.vehicle_type,
                seats: formData.details.seats === '' ? null : parseInt(formData.details.seats)
            },
            approval_status: 'pending',
            tour_code: formData.code, 
            inventory: formData.inventory, 
            image_url: 'https://placehold.co/600x400/0ea5e9/white?text=Transport',
        };
        const { error: insertError } = await supabase.from('Products').insert(dataToSubmit);
        error = insertError;
    }

    if (error) {
      toast.error("Có lỗi xảy ra: " + error.message);
      console.error("Lỗi Submit Transport:", error);
    } else {
      toast.success(editingId ? 'Cập nhật thành công!' : 'Thêm xe thành công! Chờ duyệt.');
      setFormData(initialFormData); 
      setEditingId(null);
      await fetchTransport();
    }
    setIsSubmitting(false);
  };

  // Xóa xe
  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Bạn có chắc muốn xóa xe "${productName}"?`)) {
      const { error } = await supabase
        .from('Products')
        .delete()
        .eq('id', productId)
        .eq('supplier_id', supplierId);

      if (error) {
        toast.error("Lỗi khi xóa: " + error.message);
      } else {
        toast.success('Xóa thành công!');
        if (editingId === productId) { handleCancelEdit(); }
        await fetchTransport();
      }
    }
  };

  const formatPrice = (price) => {
      if (price === null || price === undefined || price === '') return 'N/A'; 
      return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  }

  return (
    <div className="container mx-auto px-6 py-12 bg-neutral-50 dark:bg-neutral-950 min-h-screen text-neutral-800 dark:text-neutral-200">
      <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
        <CarSimple size={32} className="text-sky-500" />
        Quản lý TourZenExpress (Xe)
      </h1>

      {!supplierId && !loading && (
        <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
            <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">Tài khoản chưa liên kết</h3>
            <p className="text-yellow-700 dark:text-yellow-300 mt-2">Vui lòng liên hệ Admin để liên kết tài khoản của bạn với một Nhà cung cấp.</p>
        </div>
      )}

      {/* Form thêm mới / Chỉnh sửa */}
      {supplierId && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md mb-8 border dark:border-neutral-700 relative">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Chỉnh sửa Dịch vụ Xe' : 'Thêm xe mới'}
          </h2>
          
          {editingId && (
                <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700"
                    title="Hủy chỉnh sửa"
                >
                    <CancelIcon size={20} />
                </button>
            )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tên xe *</label>
              <input
                id="name" type="text" name="name"
                placeholder="VD: Limousine 9 chỗ Sân bay"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="vehicle_type" className="block text-sm font-medium mb-1 dark:text-neutral-300">Loại xe *</label>
              <input
                id="vehicle_type" type="text" name="vehicle_type"
                placeholder="Limousine, Xe khách..."
                value={formData.details.vehicle_type} // (SỬA) Lấy từ details
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1 dark:text-neutral-300">Giá (VNĐ) *</label>
              <input
                id="price" type="number" name="price"
                placeholder="850000"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
              />
            </div>

            {/* Hàng thứ 2 */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-1 dark:text-neutral-300">Mã Dịch vụ *</label>
              <input
                id="code" type="text" name="code"
                placeholder="VD: XE-SAN-BAY-01"
                value={formData.code} // (SỬA) Lấy từ code
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="seats" className="block text-sm font-medium mb-1 dark:text-neutral-300">Số chỗ</label>
              <input
                id="seats" type="number" name="seats"
                placeholder="9"
                value={formData.details.seats} // (SỬA) Lấy từ details
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="inventory" className="block text-sm font-medium mb-1 dark:text-neutral-300">Số lượng (Slot) *</label>
              <input
                id="inventory" type="number" name="inventory"
                placeholder="99"
                value={formData.inventory}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <CircleNotch size={20} className="animate-spin" /> : (editingId ? <Pencil size={20} /> : <PlusCircle size={20} />)}
                {editingId ? 'Cập nhật' : 'Thêm & Chờ duyệt'}
              </button>
              {editingId && (
                   <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Hủy
                    </button>
              )}
          </div>
        </form>
      )}

      {/* Bảng danh sách xe */}
      {loading ? (
        <div className="flex justify-center py-10">
            <CircleNotch size={32} className="animate-spin text-sky-500" />
        </div>
      ) : (
        supplierId && (
          <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg overflow-x-auto border dark:border-neutral-700">
            <table className="w-full min-w-max text-sm text-left">
              <thead className="text-xs uppercase bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                <tr>
                  <th className="px-6 py-3">Tên xe</th>
                  <th className="px-6 py-3">Loại</th>
                  <th className="px-6 py-3">Giá</th>
                  <th className="px-6 py-3">Số chỗ</th>
                  <th className="px-6 py-3">Số lượng</th>
                  <th className="px-6 py-3">Trạng thái duyệt</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-neutral-700">
                {transport.map((v) => (
                  <tr key={v.id} className={`hover:bg-neutral-50 dark:hover:bg-neutral-700/50 ${editingId === v.id ? 'bg-sky-50 dark:bg-sky-900/30' : ''}`}>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{v.name}</td>
                    <td className="px-6 py-4">{v.details?.vehicle_type || 'N/A'}</td>
                    <td className="px-6 py-4">{formatPrice(v.price)}</td>
                    <td className="px-6 py-4">{v.details?.seats || 'N/A'}</td>
                    <td className="px-6 py-4">{v.inventory}</td>
                    <td className="px-6 py-4"><ApprovalBadge status={v.approval_status} /></td>
                    <td className="px-6 py-4 flex justify-end gap-3">
                      {/* (THÊM MỚI) Nút Sửa */}
                      <button onClick={() => handleEditClick(v)} className="p-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400" title="Sửa">
                          <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id, v.name)}
                        className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        title="Xóa"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                 {transport.length === 0 && (
                    <tr>
                        <td colSpan="7" className="text-center py-10 text-neutral-500 italic">Bạn chưa thêm xe nào.</td>
                    </tr>
                 )}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}