// src/pages/AdminHotels.jsx
import React, { useState, useEffect } from 'react';
import { getSupabase } from "../lib/supabaseClient"; // <- Dòng import
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash, CircleNotch, X } from '@phosphor-icons/react';

// 👇 THÊM DÒNG NÀY 👇
const supabase = getSupabase();

// State khởi tạo cho một khách sạn mới
const initialState = {
  name: '',
  location: '',
  rating: 4,
  reviews: 0,
  price: 0,
  image: ''
};

export default function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentHotel, setCurrentHotel] = useState(initialState);

  // Tải tất cả khách sạn khi component mount
  useEffect(() => {
    fetchHotels();
  }, []);

  async function fetchHotels() {
    setLoading(true);
    // Giờ đây 'supabase' đã được định nghĩa
    const { data, error } = await supabase
      .from('hotels') // ⚠️ LƯU Ý: Tên bảng này có đúng không?
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Lỗi tải danh sách khách sạn!');
      console.error(error);
    } else {
      setHotels(data);
    }
    setLoading(false);
  }

  // ... (Phần code còn lại của component giữ nguyên) ...

  const handleOpenModal = (hotel = null) => {
    if (hotel) {
      setCurrentHotel(hotel);
    } else {
      setCurrentHotel(initialState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentHotel(initialState);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setCurrentHotel(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let error;

    if (currentHotel.id) {
      const { error: updateError } = await supabase
        .from('hotels') // ⚠️ Tên bảng?
        .update(currentHotel)
        .eq('id', currentHotel.id);
      error = updateError;
    } else {
      const { id, ...newHotelData } = currentHotel;
      const { error: insertError } = await supabase
        .from('hotels') // ⚠️ Tên bảng?
        .insert(newHotelData);
      error = insertError;
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(currentHotel.id ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      handleCloseModal();
      await fetchHotels();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (hotelId, hotelName) => {
    if (window.confirm(`Bạn có chắc muốn xóa khách sạn "${hotelName}"?`)) {
      const { error } = await supabase
        .from('hotels') // ⚠️ Tên bảng?
        .delete()
        .eq('id', hotelId);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Xóa thành công!');
        await fetchHotels();
      }
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + '₫';

  return (
    <div className="container mx-auto px-6 py-12 bg-neutral-50 dark:bg-neutral-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
          Quản lý Nhà cung cấp (Khách sạn)
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary-blue hover:bg-primary-blue-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Thêm mới
        </button>
      </div>

      {/* Bảng dữ liệu */}
      {loading ? (
        <div className="flex justify-center py-10">
          <CircleNotch size={32} className="animate-spin text-primary-blue" />
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg overflow-x-auto">
          <table className="w-full min-w-max text-sm text-left text-neutral-700 dark:text-neutral-300">
            <thead className="text-xs text-neutral-800 dark:text-neutral-100 uppercase bg-neutral-100 dark:bg-neutral-700">
              <tr>
                <th scope="col" className="px-6 py-3">Tên khách sạn</th>
                <th scope="col" className="px-6 py-3">Địa điểm</th>
                <th scope="col" className="px-6 py-3">Giá</th>
                <th scope="col" className="px-6 py-3">Rating</th>
                <th scope="col" className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel) => (
                <tr key={hotel.id} className="border-b dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white whitespace-nowrap">{hotel.name}</td>
                  <td className="px-6 py-4">{hotel.location}</td>
                  <td className="px-6 py-4">{formatPrice(hotel.price)}</td>
                  <td className="px-6 py-4">{hotel.rating} sao</td>
                  <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    <button onClick={() => handleOpenModal(hotel)} className="p-2 text-blue-600 hover:text-blue-800">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(hotel.id, hotel.name)} className="p-2 text-red-600 hover:text-red-800">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700">
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-white">
                  {currentHotel.id ? 'Chỉnh sửa Khách sạn' : 'Thêm Khách sạn mới'}
                </h3>
                <button type="button" onClick={handleCloseModal} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
                  <X size={24} />
                </button>
              </div>

              {/* Form Inputs */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Tên khách sạn</label>
                  <input type="text" name="name" value={currentHotel.name} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Địa điểm</label>
                  <input type="text" name="location" value={currentHotel.location} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Giá (VNĐ)</label>
                  <input type="number" name="price" value={currentHotel.price} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Rating (1-5)</label>
                  <input type="number" name="rating" min="1" max="5" value={currentHotel.rating} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Số Reviews</label>
                  <input type="number" name="reviews" value={currentHotel.reviews} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Link hình ảnh</label>
                  <input type="text" name="image" value={currentHotel.image} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" />
                </div>
              </div>

              {/* Form Actions */}
              <div className="p-4 border-t dark:border-neutral-700 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500">
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-blue text-white rounded-md font-semibold hover:bg-primary-blue-dark disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <CircleNotch size={20} className="animate-spin" />}
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}