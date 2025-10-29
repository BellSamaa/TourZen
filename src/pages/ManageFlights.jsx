// src/pages/ManageFlights.jsx
// (SỬA) Thêm quản lý số lượng (inventory)
// (SỬA) Thêm cảnh báo sắp hết hàng

import React, { useState, useEffect, useCallback } from 'react';
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
// (SỬA) Thêm WarningCircle
import { Plus, Trash, CircleNotch, AirplaneTilt, WarningCircle } from '@phosphor-icons/react';

const supabase = getSupabase();
const productType = 'flight'; 

// Các trường chi tiết cho loại 'flight'
const typeFields = {
    flight: ['airline', 'route', 'code']
};
// Hàm trợ giúp lấy nhãn
const getDetailLabel = (field) => {
  const labels = {
    airline: "Hãng bay (Vietnam Airlines...)", 
    route: "Tuyến bay (VD: HAN -> DAD)", 
    code: "Mã chuyến bay (VD: VN245)"
  };
  return labels[field] || field;
};

// State khởi tạo cho form
const initialFormData = {
  name: '',
  price: '',
  inventory: 99, // <-- (THÊM MỚI)
  details: {
    airline: '',
    route: '',
    code: ''
  },
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

export default function ManageFlights() {
  const { user } = useAuth();
  const [supplierId, setSupplierId] = useState(null);
  const [flights, setFlights] = useState([]);
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

  // Tải danh sách chuyến bay
  const fetchFlights = useCallback(async () => {
    if (!supplierId) {
        setLoading(false);
        return;
    } 
    setLoading(true);
    const { data, error } = await supabase
      .from('Products')
      .select('*') // Lấy tất cả, bao gồm 'inventory'
      .eq('product_type', productType)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Lỗi tải danh sách chuyến bay!');
    } else {
      setFlights(data || []);
      // (THÊM MỚI) Logic thông báo sắp hết hàng
      const lowStock = data.filter(f => f.inventory <= 5 && f.inventory > 0);
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
                                  Có {lowStock.length} chuyến bay sắp hết hàng: {lowStock.map(f => f.name).join(', ')}.
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
    fetchFlights();
  }, [fetchFlights]);

  // Xử lý thay đổi input (hỗ trợ nested details)
  const handleChange = (e) => {
    const { name, value, type: inputType } = e.target;
    // (SỬA) Thêm 'inventory'
    if (name === 'name' || name === 'price' || name === 'inventory') {
      let newValue = value;
      if ((name === 'price' || name === 'inventory') && inputType === 'number') {
        // (SỬA) Dùng parseInt
        newValue = value === '' ? '' : parseInt(value) || 0; 
      }
      setFormData(prev => ({ ...prev, [name]: newValue }));
    } else {
      setFormData(prev => ({
        ...prev,
        details: {
          ...prev.details,
          [name]: (inputType === 'number') ? parseFloat(value) || 0 : value,
        }
      }));
    }
  };

  // Xử lý submit (Chỉ Thêm mới)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId) {
        toast.error("Không thể thêm vì tài khoản chưa liên kết NCC.");
        return;
    }
    if (!formData.name || !formData.details.code || !formData.details.route) {
        toast.error('Vui lòng nhập Tên, Mã chuyến bay và Tuyến bay.');
        return;
    }
    setIsSubmitting(true);

    // --- SỬA LỖI 400 TẠI ĐÂY ---
    const dataToSubmit = {
        name: formData.name,
        product_type: productType,
        supplier_id: supplierId,
        price: formData.price === '' ? null : formData.price, 
        details: formData.details,
        approval_status: 'pending', 
        
        // Bổ sung các trường NOT NULL
        tour_code: formData.details.code, // Lấy mã chuyến bay làm tour_code
        inventory: formData.inventory, // (SỬA) Lấy từ form
        image_url: 'https://placehold.co/600x400/0ea5e9/white?text=Flight', // Ảnh mặc định
    };
    // --- KẾT THÚC SỬA ---

    // Chỉ thực hiện INSERT
    const { error } = await supabase
      .from('Products')
      .insert(dataToSubmit);

    if (error) {
      toast.error("Có lỗi xảy ra: " + error.message);
      console.error("Lỗi Submit Flights:", error);
    } else {
      toast.success('Thêm mới thành công! Chờ duyệt.');
      setFormData(initialFormData); // Reset form
      await fetchFlights(); 
    }
    setIsSubmitting(false);
  };

  // Xử lý xóa
  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Bạn có chắc muốn xóa chuyến bay "${productName}"?`)) {
      const { error } = await supabase
        .from('Products')
        .delete()
        .eq('id', productId)
        .eq('supplier_id', supplierId);

      if (error) {
        toast.error("Lỗi khi xóa: " + error.message);
      } else {
        toast.success('Xóa thành công!');
        await fetchFlights(); 
      }
    }
  };

  const formatPrice = (price) => {
      if (price === null || price === undefined || price === '') return 'N/A'; 
      return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  }

  return (
    <div className="container mx-auto px-6 py-12 bg-neutral-50 dark:bg-neutral-950 min-h-screen text-neutral-800 dark:text-neutral-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <AirplaneTilt size={32} className="text-sky-500" />
          Quản lý Chuyến bay
        </h1>
      </div>

      {!supplierId && !loading && (
        <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
            <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">Tài khoản chưa liên kết</h3>
            <p className="text-yellow-700 dark:text-yellow-300 mt-2">Vui lòng liên hệ Admin để liên kết tài khoản của bạn với một Nhà cung cấp.</p>
        </div>
      )}

      {/* FORM THÊM NHANH */}
      {supplierId && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md mb-8 border dark:border-neutral-700">
            <h2 className="text-xl font-semibold mb-4">Thêm nhanh Chuyến bay</h2>
            {/* (SỬA) Layout grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tên hiển thị *</label>
                    <input id="name" type="text" name="name" placeholder="VD: Vé máy bay + Xe đưa đón" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-1 dark:text-neutral-300">Giá (VNĐ)</label>
                    <input id="price" type="number" name="price" placeholder="Giá vé (hoặc giá combo)" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>
                {/* (THÊM MỚI) Input Số lượng */}
                <div>
                    <label htmlFor="inventory" className="block text-sm font-medium mb-1 dark:text-neutral-300">Số lượng *</label>
                    <input id="inventory" type="number" name="inventory" placeholder="99" value={formData.inventory} onChange={handleChange} required min="0" className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>

                {/* Hàng 2 */}
                <div>
                    <label htmlFor="code" className="block text-sm font-medium mb-1 capitalize dark:text-neutral-300">{getDetailLabel('code')} *</label>
                    <input id="code" type="text" name="code" value={formData.details.code} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="airline" className="block text-sm font-medium mb-1 capitalize dark:text-neutral-300">{getDetailLabel('airline')}</label>
                    <input id="airline" type="text" name="airline" value={formData.details.airline} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="route" className="block text-sm font-medium mb-1 capitalize dark:text-neutral-300">{getDetailLabel('route')} *</label>
                    <input id="route" type="text" name="route" value={formData.details.route} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
                {isSubmitting ? <CircleNotch size={20} className="animate-spin" /> : <Plus size={20} />}
                Thêm & Chờ duyệt
            </button>
        </form>
      )}

      {/* Bảng dữ liệu */}
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
                <th scope="col" className="px-6 py-3">Tên</th>
                <th scope="col" className="px-6 py-3">Mã CB</th>
                <th scope="col" className="px-6 py-3">Hãng bay</th>
          _     <th scope="col" className="px-6 py-3">Tuyến bay</th>
                <th scope="col" className="px-6 py-3">Giá</th>
                {/* (THÊM MỚI) Cột số lượng */}
                <th scope="col" className="px-6 py-3">Số lượng</th>
                <th scope="col" className="px-6 py-3">Trạng thái duyệt</th>
                <th scope="col" className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-neutral-700">
              {flights.map((flight) => (
                <tr key={flight.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{flight.name}</td>
                  <td className="px-6 py-4">{flight.details?.code || 'N/A'}</td>
                  <td className="px-6 py-4">{flight.details?.airline || 'N/A'}</td>
                  <td className="px-6 py-4">{flight.details?.route || 'N/A'}</td>
                  <td className="px-6 py-4">{formatPrice(flight.price)}</td>
                    {/* (THÊM MỚI) Data số lượng */}
                    <td className={`px-6 py-4 font-medium ${flight.inventory <= 5 ? 'text-red-500' : ''}`}>
                        {flight.inventory}
                    </td>
                  <td className="px-6 py-4"><ApprovalBadge status={flight.approval_status} /></td>
                  <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    <button onClick={() => handleDelete(flight.id, flight.name)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400" title="Xóa">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {flights.length === 0 && (
                <tr>
                    {/* (SỬA) colSpan="8" */}
                    <td colSpan="8" className="text-center py-10 text-neutral-500 italic">Bạn chưa thêm chuyến bay nào.</td>
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