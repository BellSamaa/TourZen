// src/pages/ManageSuppliers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash, CircleNotch, X, Buildings, Car, AirplaneTilt } from '@phosphor-icons/react';

const supabase = getSupabase();

const initialFormData = {
  name: '',
  type: 'hotel', // Loại mặc định
  price: '',
  details: {}, // Chi tiết cụ thể dựa trên loại
};

// Hàm trợ giúp lấy nhãn/placeholder dựa trên loại
const getDetailLabel = (type, field) => {
  const labels = {
    hotel: { location: "Địa điểm", rating: "Đánh giá (1-5 sao)", image: "Link ảnh" },
    transport: { vehicle_type: "Loại xe (Limousine, Xe khách...)", seats: "Số chỗ", image: "Link ảnh" },
    flight: { airline: "Hãng bay", route: "Tuyến bay (VD: HAN -> DAD)", code: "Mã chuyến bay" },
  };
  return labels[type]?.[field] || field;
};

// Các trường cần thiết cho mỗi loại
const typeFields = {
    hotel: ['location', 'rating', 'image'],
    transport: ['vehicle_type', 'seats', 'image'],
    flight: ['airline', 'route', 'code']
};

export default function ManageSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null); // Để theo dõi đang sửa hay thêm mới

  // Hàm tải danh sách NCC
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    // Lấy TẤT CẢ NCC (vì admin cần xem cả cái chưa duyệt)
    const { data, error } = await supabase
      .from('Suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Lỗi tải danh sách nhà cung cấp!');
      console.error(error);
    } else {
      setSuppliers(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Mở modal (form)
  const handleOpenModal = (supplier = null) => {
    if (supplier) { // Nếu có supplier -> chế độ sửa
      setFormData({
        name: supplier.name,
        type: supplier.type,
        price: supplier.price ?? '', // Dùng ?? để tránh lỗi nếu price là null
        details: supplier.details || {},
      });
      setEditingId(supplier.id);
    } else { // Nếu không -> chế độ thêm mới
      setFormData(initialFormData);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData); // Reset form
    setEditingId(null);
  };

  // Xử lý thay đổi input trong form
  const handleChange = (e) => {
    const { name, value, type: inputType } = e.target;
    // Xử lý các trường chính (name, type, price)
    if (name === 'name' || name === 'type' || name === 'price') {
      let newValue = value;
      if (name === 'price' && inputType === 'number') {
        newValue = value === '' ? '' : parseFloat(value) || 0; // Chuyển sang số hoặc giữ rỗng
      }
      // Reset details nếu đổi type
      const newDetails = name === 'type' ? {} : formData.details;
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
        details: newDetails
      }));
    } else {
      // Xử lý các trường trong 'details'
      setFormData(prev => ({
        ...prev,
        details: {
          ...prev.details,
          // Chuyển sang số nếu là input number
          [name]: (inputType === 'number' && name !== 'code' && name !== 'route' && name !== 'location' && name !== 'airline' && name !== 'vehicle_type' && name !== 'image') ? parseFloat(value) || 0 : value,
        }
      }));
    }
  };

  // Xử lý submit form (thêm mới hoặc cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
        toast.error('Vui lòng nhập Tên và Chọn Loại nhà cung cấp.');
        return;
    }
    setIsSubmitting(true);
    let error;

    // Chuẩn bị dữ liệu gửi đi
    const dataToSubmit = {
        name: formData.name,
        type: formData.type,
        price: formData.price === '' ? null : formData.price, // Cho phép giá null
        details: formData.details,
        // Luôn đặt lại thành 'pending' khi thêm mới hoặc sửa (admin cần duyệt lại)
        approval_status: 'pending',
    };

    if (editingId) { // Cập nhật NCC hiện có
      const { error: updateError } = await supabase
        .from('Suppliers')
        .update(dataToSubmit)
        .eq('id', editingId);
      error = updateError;
    } else { // Thêm NCC mới
      const { error: insertError } = await supabase
        .from('Suppliers')
        .insert(dataToSubmit);
      error = insertError;
    }

    if (error) {
      toast.error("Có lỗi xảy ra: " + error.message);
      console.error("Lỗi Submit:", error);
    } else {
      toast.success(editingId ? 'Cập nhật thành công! Chờ duyệt lại.' : 'Thêm mới thành công! Chờ duyệt.');
      handleCloseModal(); // Đóng form
      await fetchSuppliers(); // Tải lại danh sách
    }
    setIsSubmitting(false);
  };

  // Xử lý xóa NCC
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
        await fetchSuppliers(); // Tải lại danh sách
      }
    }
  };

  // Định dạng tiền tệ
  const formatPrice = (price) => {
      if (price === null || price === undefined || price === '') return 'N/A'; // Hiển thị N/A nếu giá rỗng
      return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  }

  // Lấy badge trạng thái
  const getStatusBadge = (status) => {
      switch (status) {
          case 'approved': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Đã duyệt</span>;
          case 'rejected': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Từ chối</span>;
          default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Đang chờ</span>;
      }
  };

  // Lấy icon theo loại
   const getTypeIcon = (type) => {
       switch(type) {
           case 'hotel': return <Buildings size={16} className="text-blue-500" />;
           case 'transport': return <Car size={16} className="text-orange-500" />;
           case 'flight': return <AirplaneTilt size={16} className="text-indigo-500" />;
           default: return null;
       }
   }

  return (
    // Phần JSX hiển thị giao diện (tương tự file AdminHotels cũ nhưng dùng chung cho các loại)
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

      {/* Bảng dữ liệu */}
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
                <th scope="col" className="px-6 py-3">Loại</th>
                <th scope="col" className="px-6 py-3">Chi tiết</th>
                <th scope="col" className="px-6 py-3">Giá cơ bản</th>
                <th scope="col" className="px-6 py-3">Trạng thái</th>
                <th scope="col" className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-neutral-700">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{supplier.name}</td>
                  <td className="px-6 py-4 flex items-center gap-2 capitalize">
                     {getTypeIcon(supplier.type)} {supplier.type === 'hotel' ? 'Khách sạn' : supplier.type === 'transport' ? 'Vận chuyển' : 'Chuyến bay'}
                  </td>
                  <td className="px-6 py-4 text-xs">
                     {/* Hiển thị chi tiết liên quan */}
                     {supplier.type === 'hotel' && `📍 ${supplier.details?.location || 'N/A'} ⭐ ${supplier.details?.rating || 'N/A'}`}
                     {supplier.type === 'transport' && `🚗 ${supplier.details?.vehicle_type || 'N/A'} (${supplier.details?.seats || '?'} chỗ)`}
                     {supplier.type === 'flight' && `✈️ ${supplier.details?.airline || 'N/A'} (${supplier.details?.code || 'N/A'}) - ${supplier.details?.route || 'N/A'}`}
                  </td>
                  <td className="px-6 py-4">{formatPrice(supplier.price)}</td>
                  <td className="px-6 py-4">{getStatusBadge(supplier.approval_status)}</td>
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
                    <td colSpan="6" className="text-center py-10 text-neutral-500 italic">Chưa có nhà cung cấp nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 scale-100">
            <form onSubmit={handleSubmit}>
              {/* Header Modal */}
              <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-800 z-10">
                <h3 className="text-xl font-semibold">
                  {editingId ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}
                </h3>
                <button type="button" onClick={handleCloseModal} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
                  <X size={24} />
                </button>
              </div>

              {/* Form Inputs */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Các trường chung */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tên Nhà cung cấp *</label>
                  <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium mb-1 dark:text-neutral-300">Loại *</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white">
                        <option value="hotel">Khách sạn</option>
                        <option value="transport">Vận chuyển</option>
                        <option value="flight">Chuyến bay</option>
                    </select>
                </div>
                 <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-1 dark:text-neutral-300">Giá cơ bản (VNĐ)</label>
                  <input id="price" type="number" name="price" placeholder="Để trống nếu không áp dụng" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" />
                </div>

                 {/* Các trường theo loại */}
                 <div className="md:col-span-2 border-t dark:border-neutral-700 pt-4 mt-2">
                    <h4 className="text-md font-semibold mb-2 dark:text-neutral-200">Chi tiết cho loại '{formData.type === 'hotel' ? 'Khách sạn' : formData.type === 'transport' ? 'Vận chuyển' : 'Chuyến bay'}'</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Render các input dựa trên typeFields */}
                        {typeFields[formData.type]?.map(field => (
                            <div key={field}>
                                <label htmlFor={field} className="block text-sm font-medium mb-1 capitalize dark:text-neutral-300">
                                    {getDetailLabel(formData.type, field)}
                                </label>
                                <input
                                    id={field}
                                    // Xác định type của input
                                    type={(field === 'rating' || field === 'seats' || field === 'reviews') ? 'number' : 'text'}
                                    name={field}
                                    value={formData.details[field] || ''} // Lấy giá trị từ formData.details
                                    onChange={handleChange} // Dùng chung hàm handleChange
                                    // Thêm ràng buộc cho input number nếu cần
                                    min={field === 'rating' ? 1 : field === 'seats' ? 1 : undefined}
                                    max={field === 'rating' ? 5 : undefined}
                                    step={field === 'rating' ? 0.1 : undefined}
                                    className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
                                />
                            </div>
                        ))}
                    </div>
                 </div>
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
          </div>
        </div>
      )}
    </div>
  );
}