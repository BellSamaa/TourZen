// src/pages/ManageFlights.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext"; // 1. Thêm AuthContext
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash, CircleNotch, X, AirplaneTilt, FaCheckCircle, FaTimesCircle, FaSyncAlt } from '@phosphor-icons/react';

const supabase = getSupabase();
const productType = 'flight'; // Hardcode loại sản phẩm cho trang này

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
  const { user } = useAuth(); // 2. Lấy user
  const [supplierId, setSupplierId] = useState(null); // 3. State cho supplier_id
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null); 

  // 4. Tìm Supplier ID từ User ID
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

  // 5. Tải danh sách chuyến bay (từ bảng Products)
  const fetchFlights = useCallback(async () => {
    if (!supplierId) {
        setLoading(false);
        return;
    } 
    setLoading(true);
    const { data, error } = await supabase
      .from('Products')
      .select('*')
      .eq('product_type', productType) // Lọc đúng loại
      .eq('supplier_id', supplierId) // Lọc đúng NCC
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

  // Mở modal (form)
  const handleOpenModal = (flight = null) => {
    if (flight) { // Chế độ sửa
      setFormData({
        name: flight.name,
        price: flight.price ?? '', 
        details: flight.details || initialFormData.details,
      });
      setEditingId(flight.id);
    } else { // Chế độ thêm mới
      setFormData(initialFormData);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData); 
    setEditingId(null);
  };

  // Xử lý thay đổi input (hỗ trợ nested details)
  const handleChange = (e) => {
    const { name, value, type: inputType } = e.target;
    if (name === 'name' || name === 'price') {
      let newValue = value;
      if (name === 'price' && inputType === 'number') {
        newValue = value === '' ? '' : parseFloat(value) || 0; 
      }
      setFormData(prev => ({ ...prev, [name]: newValue }));
    } else {
      // Xử lý các trường trong 'details'
      setFormData(prev => ({
        ...prev,
        details: {
          ...prev.details,
          [name]: (inputType === 'number') ? parseFloat(value) || 0 : value,
        }
      }));
    }
  };

  // Xử lý submit (Thêm/Sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId) {
        toast.error("Không thể thêm/sửa vì tài khoản chưa liên kết NCC.");
        return;
    }
    if (!formData.name || !formData.details.code || !formData.details.route) {
        toast.error('Vui lòng nhập Tên, Mã chuyến bay và Tuyến bay.');
        return;
    }
    setIsSubmitting(true);
    let error;

    const dataToSubmit = {
        name: formData.name,
        product_type: productType, // Hardcode
        supplier_id: supplierId, // Gắn ID của NCC
        price: formData.price === '' ? null : formData.price, 
        details: formData.details,
        approval_status: 'pending', // Luôn chờ duyệt
    };

    if (editingId) { // Cập nhật
      const { error: updateError } = await supabase
        .from('Products')
        .update(dataToSubmit)
        .eq('id', editingId)
        .eq('supplier_id', supplierId); 
      error = updateError;
    } else { // Thêm mới
      const { error: insertError } = await supabase
        .from('Products')
        .insert(dataToSubmit);
      error = insertError;
    }

    if (error) {
      toast.error("Có lỗi xảy ra: " + error.message);
    } else {
      toast.success(editingId ? 'Cập nhật thành công! Chờ duyệt lại.' : 'Thêm mới thành công! Chờ duyệt.');
      handleCloseModal(); 
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
        {supplierId && (
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Thêm chuyến bay
        </button>
        )}
      </div>

      {!supplierId && !loading && (
        <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
            <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">Tài khoản chưa liên kết</h3>
            <p className="text-yellow-700 dark:text-yellow-300 mt-2">Vui lòng liên hệ Admin để liên kết tài khoản của bạn với một Nhà cung cấp.</p>
        </div>
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
T               <th scope="col" className="px-6 py-3">Tuyến bay</th>
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
                    <button onClick={() => handleOpenModal(flight)} className="p-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400" title="Sửa">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(flight.id, flight.name)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400" title="Xóa">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {flights.length === 0 && (
                <tr>
                    <td colSpan="7" className="text-center py-10 text-neutral-500 italic">Bạn chưa thêm chuyến bay nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )
      )}

      {/* Modal Form Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 scale-100">
            <form onSubmit={handleSubmit}>
              {/* Header Modal */}
              <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-800 z-10">
                <h3 className="text-xl font-semibold">
                  {editingId ? 'Chỉnh sửa chuyến bay' : 'Thêm chuyến bay mới'}
                </h3>
                <button type="button" onClick={handleCloseModal} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
                  <X size={24} />
            _   </button>
              </div>

              {/* Form Inputs */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tên hiển thị *</label>
                  <input id="name" type="text" name="name" placeholder="VD: Vé máy bay + Xe đưa đón sân bay" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
AN             </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-1 dark:text-neutral-300">Giá (VNĐ)</label>
                  <input id="price" type="number" name="price" placeholder="Giá vé (hoặc giá combo)" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>

                {/* Render các input dựa trên typeFields */}
                {typeFields[productType]?.map(field => (
                    <div key={field}>
                        <label htmlFor={field} className="block text-sm font-medium mb-1 capitalize dark:text-neutral-300">
                            {getDetailLabel(field)}
                        </label>
                        <input
                            id={field}
                            type={'text'}
                            name={field}
                            value={formData.details[field] || ''} 
                            onChange={handleChange} 
                            className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
                        />
                    </div>
                ))}
              </div>

              {/* Nút bấm ở Footer Modal */}
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
                  {editingId ? 'Lưu thay đổi' : 'Thêm & Chờ duyệt'}
                </button>
              </div>
            </form>
section         </div>
        </div>
      )}
    </div>
  );
}