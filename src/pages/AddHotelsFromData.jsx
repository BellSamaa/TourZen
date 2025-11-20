// src/pages/AddHotelsFromData.jsx
import React, { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabaseClient';
// 👇 1. Import dữ liệu KHÁCH SẠN (đảm bảo tên file và biến đúng) 👇
import { HOTELS_DATA } from '../data/hotels'; // Hoặc file chứa HOTELS_DATA
import { FaPlus, FaCheckCircle, FaSpinner, FaExclamationCircle } from 'react-icons/fa';

const supabase = getSupabase();

export default function AddHotelsFromData() {
  // 👇 2. Sử dụng HOTELS_DATA 👇
  const [localHotels, setLocalHotels] = useState(HOTELS_DATA);
  const [suppliers, setSuppliers] = useState([]);
  const [addingStatus, setAddingStatus] = useState({});
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [dbHotelCodes, setDbHotelCodes] = useState(new Set()); // Lưu mã khách sạn đã có

  useEffect(() => {
    async function fetchData() {
      setLoadingSuppliers(true);
      const [supplierRes, productRes] = await Promise.all([
        supabase.from('Suppliers').select('id, name'),
        // 👇 3. Lấy mã của KHÁCH SẠN đã có từ bảng Products 👇
        supabase.from('Products').select('tour_code').eq('product_type', 'hotel')
      ]);

      if (supplierRes.data) {
        setSuppliers(supplierRes.data);
      } else {
        console.error('Lỗi fetch suppliers:', supplierRes.error);
      }

      if (productRes.data) {
        setDbHotelCodes(new Set(productRes.data.map(p => p.tour_code)));
      } else {
         console.error('Lỗi fetch existing hotel codes:', productRes.error);
      }
      setLoadingSuppliers(false);
    }
    fetchData();
  }, []);

  // 4. Đổi tên hàm thành handleAddHotel
  const handleAddHotel = async (hotelToAdd) => {
    // 👇 5. Dùng id khách sạn làm mã (tour_code) 👇
    const hotelCode = String(hotelToAdd.id); // Đảm bảo là string

    if (dbHotelCodes.has(hotelCode)) {
       setAddingStatus((prev) => ({ ...prev, [hotelCode]: 'exists' }));
       return;
    }

    setAddingStatus((prev) => ({ ...prev, [hotelCode]: 'adding' }));

    // Logic chọn NCC giữ nguyên
    let selectedSupplierId = null;
    if (suppliers.length > 0) {
        const supplierChoice = prompt(
          `Thêm khách sạn "${hotelToAdd.name}".\nChọn nhà cung cấp (nhập số):\n` +
          suppliers.map((s, index) => `${index + 1}. ${s.name}`).join('\n') +
          `\n(Bỏ trống nếu không muốn chọn)`
        );
         if (supplierChoice && !isNaN(supplierChoice)) {
           const index = parseInt(supplierChoice, 10) - 1;
           if (index >= 0 && index < suppliers.length) {
             selectedSupplierId = suppliers[index].id;
           }
         }
    }

    // 👇 6. Chuẩn bị dữ liệu khách sạn CHO BẢNG PRODUCTS 👇
    const productData = {
      name: hotelToAdd.name,
      tour_code: hotelCode, // Mã khách sạn (duy nhất)
      price: hotelToAdd.price || null, // Giá (có thể null)
      inventory: hotelToAdd.inventory || 50, // Số phòng mặc định
      product_type: 'hotel', // <-- QUAN TRỌNG
      supplier_id: selectedSupplierId, // NCC nếu có
      image_url: hotelToAdd.image_url || null, // Ảnh chính
      description: hotelToAdd.description || null,
      duration: hotelToAdd.duration || 'Giá / đêm', // Có thể là 'Giá / đêm'
      location: hotelToAdd.location || null,
      rating: hotelToAdd.rating || null,
      galleryImages: hotelToAdd.galleryImages || null, // Thư viện ảnh
      approval_status: 'pending', // <-- MẶC ĐỊNH LÀ CHỜ DUYỆT
      // Thêm các cột khác của Products nếu cần (ví dụ: details)
      details: { // Ví dụ lưu rating, tiện nghi vào details (jsonb)
          rating: hotelToAdd.rating || null,
          amenities: hotelToAdd.amenities || [], // Giả sử hotels.js có amenities
      }
    };

    // Thực hiện INSERT vào bảng Products
    const { error: insertError } = await supabase
      .from('Products') // <-- Bảng Products
      .insert(productData);

    if (insertError) {
      console.error('Lỗi insert hotel:', insertError);
      setAddingStatus((prev) => ({ ...prev, [hotelCode]: 'error' }));
      if (insertError.code === '23505') { // Lỗi trùng mã (tour_code)
          alert(`Lỗi khi thêm khách sạn "${hotelToAdd.name}": Mã "${hotelCode}" đã tồn tại.`);
          setAddingStatus((prev) => ({ ...prev, [hotelCode]: 'exists' }));
          setDbHotelCodes(prev => new Set(prev).add(hotelCode));
      } else {
          alert(`Lỗi khi thêm khách sạn "${hotelToAdd.name}": ${insertError.message}`);
      }
    } else {
      setAddingStatus((prev) => ({ ...prev, [hotelCode]: 'added' }));
      setDbHotelCodes(prev => new Set(prev).add(hotelCode));
      alert(`Đã thêm "${hotelToAdd.name}" vào danh sách chờ duyệt.`);
    }
  };

  // --- RENDER ---
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Thêm nhanh Khách sạn từ Dữ liệu mẫu (Chờ duyệt)
      </h1>

      {loadingSuppliers ? (
         <div className="flex justify-center items-center h-40">
           <FaSpinner className="animate-spin text-3xl text-sky-500 mr-3" />
           <span>Đang tải dữ liệu...</span>
         </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* 👇 7. Lặp qua localHotels 👇 */}
            {localHotels.map((hotel) => {
              const hotelCodeString = String(hotel.id);
              const status = addingStatus[hotelCodeString] || (dbHotelCodes.has(hotelCodeString) ? 'exists' : 'idle');

              return (
                <li key={hotel.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-700">
                  <div className="flex items-center space-x-4">
                    <img
                      src={hotel.image_url || 'https://placehold.co/60x60/eee/ccc?text=Img'} // Dùng image_url
                      alt={hotel.name}
                      className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                    />
                    <div>
                      {/* 👇 Hiển thị tên khách sạn 👇 */}
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{hotel.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID/Code: {hotel.id} - Giá: {(hotel.price || 0).toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                  </div>

                  {/* Nút Thêm và Trạng thái */}
                  <div className="flex items-center space-x-2">
                     {status === 'idle' && (
                       <button
                         onClick={() => handleAddHotel(hotel)} // Gọi handleAddHotel
                         className="p-2 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200"
                         title="Thêm vào database (Chờ duyệt)"
                       >
                         <FaPlus size={14} />
                       </button>
                     )}
                     {status === 'adding' && (
                       <FaSpinner className="animate-spin text-sky-500" />
                     )}
                     {status === 'added' && (
                       <FaCheckCircle className="text-green-500" title="Đã thêm (Chờ duyệt)" />
                     )}
                      {status === 'exists' && (
                       <span className="text-xs text-gray-400 italic" title="Khách sạn này đã có trong database">Đã tồn tại</span>
                     )}
                     {status === 'error' && (
                       <button onClick={() => handleAddHotel(hotel)} className="text-red-500 hover:text-red-700" title="Lỗi! Bấm để thử lại">
                         <FaExclamationCircle />
                       </button>
                     )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}