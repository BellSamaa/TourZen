// src/pages/ManageTransport.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import { PlusCircle, Trash, CircleNotch, CarSimple } from "@phosphor-icons/react";

const supabase = getSupabase();
const productType = 'transport';

// State khởi tạo cho form
const initialFormData = {
  name: "",
  vehicle_type: "", // Đổi 'type' thành 'vehicle_type'
  price: "",
  seats: "",
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
    }
    setLoading(false);
  }, [supplierId]);

  useEffect(() => {
    fetchTransport();
  }, [fetchTransport]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // Gửi form (Thêm mới)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId) {
        toast.error("Không thể thêm vì tài khoản chưa liên kết NCC.");
        return;
    }
    if (!formData.name || !formData.vehicle_type || !formData.price) {
        toast.error('Vui lòng nhập Tên xe, Loại xe và Giá.');
        return;
    }
    setIsSubmitting(true);

    const dataToSubmit = {
        name: formData.name,
        product_type: productType,
        supplier_id: supplierId,
        price: formData.price === '' ? null : parseFloat(formData.price),
        details: {
            vehicle_type: formData.vehicle_type,
            seats: formData.seats === '' ? null : parseInt(formData.seats)
        },
        approval_status: 'pending', // Chờ duyệt
    };

    const { error } = await supabase.from('Products').insert(dataToSubmit);

    if (error) {
      toast.error("Có lỗi xảy ra: " + error.message);
    } else {
      toast.success('Thêm xe thành công! Chờ duyệt.');
      setFormData(initialFormData); // Reset form
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

      {/* Form thêm mới */}
      {supplierId && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md mb-8 border dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">Thêm xe mới</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tên xe *</label>
              <input
                id="name"
                type="text"
                name="name"
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
                id="vehicle_type"
                type="text"
                name="vehicle_type"
                placeholder="Limousine, Xe khách..."
                value={formData.vehicle_type}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
              />
            </div>
            <div>
              {/* --- SỬA LỖI Ở ĐÂY --- */}
              <label htmlFor="price" className="block text-sm font-medium mb-1 dark:text-neutral-300">Giá (VNĐ) *</label>
              {/* --- KẾT THÚC SỬA LỖI --- */}
              <input
                id="price"
                type="number"
                name="price"
                placeholder="850000"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="seats" className="block text-sm font-medium mb-1 dark:text-neutral-300">Số chỗ</label>
              <input
                id="seats"
                type="number"
                name="seats"
                placeholder="9"
                value={formData.seats}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <CircleNotch size={20} className="animate-spin" /> : <PlusCircle size={20} />}
            Thêm & Chờ duyệt
          </button>
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
                  <th className="px-6 py-3">Trạng thái duyệt</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-neutral-700">
                {transport.map((v) => (
                  <tr key={v.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{v.name}</td>
                    <td className="px-6 py-4">{v.details?.vehicle_type || 'N/A'}</td>
                    <td className="px-6 py-4">{formatPrice(v.price)}</td>
                    <td className="px-6 py-4">{v.details?.seats || 'N/A'}</td>
                    <td className="px-6 py-4"><ApprovalBadge status={v.approval_status} /></td>
                    <td className="px-6 py-4 flex justify-end gap-3">
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
                        <td colSpan="6" className="text-center py-10 text-neutral-500 italic">Bạn chưa thêm xe nào.</td>
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