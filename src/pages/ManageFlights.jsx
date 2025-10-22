// src/pages/ManageFlights.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import { Plus, Trash, CircleNotch, AirplaneTilt } from '@phosphor-icons/react'; // Bỏ Pencil, X

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
  details: {
    airline: '',
    route: '',
    code: ''
  },
};

// Helper hiển thị trạng thái (Giữ nguyên)
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
  // Bỏ isModalOpen và editingId

  // Tìm Supplier ID từ User ID (Giữ nguyên)
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

  // Tải danh sách chuyến bay (Giữ nguyên)
  const fetchFlights = useCallback(async () => {
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
      toast.error('Lỗi tải danh sách chuyến bay!');
    } else {
      setFlights(data || []);
    }
    setLoading(false);
  }, [supplierId]); 

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  // Xử lý thay đổi input (hỗ trợ nested details) - Giữ nguyên
  const handleChange = (e) => {
    const { name, value, type: inputType } = e.target;
    if (name === 'name' || name === 'price') {
      let newValue = value;
      if (name === 'price' && inputType === 'number') {
        newValue = value === '' ? '' : parseFloat(value) || 0; 
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

    const dataToSubmit = {
        name: formData.name,
        product_type: productType,
        supplier_id: supplierId,
        price: formData.price === '' ? null : formData.price, 
        details: formData.details,
        approval_status: 'pending', // Luôn chờ duyệt
    };

    // Chỉ thực hiện INSERT
    const { error } = await supabase
      .from('Products')
      .insert(dataToSubmit);

    if (error) {
      toast.error("Có lỗi xảy ra: " + error.message);
    } else {
      toast.success('Thêm mới thành công! Chờ duyệt.');
      setFormData(initialFormData); // Reset form
      await fetchFlights(); 
    }
    setIsSubmitting(false);
  };

  // Xử lý xóa (Giữ nguyên)
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
        {/* Bỏ nút Thêm modal */}
      </div>

      {!supplierId && !loading && (
        <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
            <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">Tài khoản chưa liên kết</h3>
            <p className="text-yellow-700 dark:text-yellow-300 mt-2">Vui lòng liên hệ Admin để liên kết tài khoản của bạn với một Nhà cung cấp.</p>
        </div>
      )}

      {/* --- FORM THÊM NHANH MỚI --- */}
      {supplierId && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md mb-8 border dark:border-neutral-700">
            <h2 className="text-xl font-semibold mb-4">Thêm nhanh Chuyến bay</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tên hiển thị */}
                <div className="md:col-span-1">
                    <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tên hiển thị *</label>
                    <input id="name" type="text" name="name" placeholder="VD: Vé máy bay + Xe đưa đón" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>
                {/* Giá */}
                <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-1 dark:text-neutral-300">Giá (VNĐ)</label>
                    <input id="price" type="number" name="price" placeholder="Giá vé (hoặc giá combo)" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>
                {/* Mã chuyến bay */}
                <div>
                    <label htmlFor="code" className="block text-sm font-medium mb-1 capitalize dark:text-neutral-300">{getDetailLabel('code')} *</label>
                    <input id="code" type="text" name="code" value={formData.details.code} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>
                {/* Hãng bay */}
                <div>
                    <label htmlFor="airline" className="block text-sm font-medium mb-1 capitalize dark:text-neutral-300">{getDetailLabel('airline')}</label>
                    <input id="airline" type="text" name="airline" value={formData.details.airline} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>
                {/* Tuyến bay */}
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
      {/* --- KẾT THÚC FORM --- */}


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
                <th scope="col" className="px-6 py-3">Tuyến bay</th>
                <th scope="col" className="px-6 py-3">Giá</th>
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
                  <td className="px-6 py-4"><ApprovalBadge status={flight.approval_status} /></td>
                  <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    {/* Bỏ nút Sửa */}
                    <button onClick={() => handleDelete(flight.id, flight.name)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400" title="Xóa">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
  S             {flights.length === 0 && (
                <tr>
                    <td colSpan="7" className="text-center py-10 text-neutral-500 italic">Bạn chưa thêm chuyến bay nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )
      )}

      {/* Bỏ Modal Form */}
    </div>
  );
}