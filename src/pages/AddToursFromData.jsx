// src/pages/AddToursFromData.jsx
import React, { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { TOURS_DATA } from '../data/tours_updated'; // 1. Import dữ liệu tour mẫu
import { FaPlus, FaCheckCircle, FaSpinner, FaExclamationCircle } from 'react-icons/fa';

const supabase = getSupabase();

export default function AddToursFromData() {
  const [localTours, setLocalTours] = useState(TOURS_DATA);
  const [suppliers, setSuppliers] = useState([]);
  const [addingStatus, setAddingStatus] = useState({}); // Lưu trạng thái: 'idle', 'adding', 'added', 'error', 'exists'
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [dbTourCodes, setDbTourCodes] = useState(new Set()); // Lưu các tour_code đã có trong DB

  // 2. Lấy danh sách Nhà cung cấp và các tour_code đã có trong DB
  useEffect(() => {
    async function fetchData() {
      setLoadingSuppliers(true);
      const [supplierRes, productRes] = await Promise.all([
        supabase.from('Suppliers').select('id, name'),
        supabase.from('Products').select('tour_code').eq('product_type', 'tour') // Chỉ lấy code của tour
      ]);

      if (supplierRes.data) {
        setSuppliers(supplierRes.data);
      } else {
        console.error('Lỗi fetch suppliers:', supplierRes.error);
      }

      if (productRes.data) {
        // Lưu các tour code đã có vào Set để kiểm tra nhanh
        setDbTourCodes(new Set(productRes.data.map(p => p.tour_code)));
      } else {
         console.error('Lỗi fetch existing tour codes:', productRes.error);
      }

      setLoadingSuppliers(false);
    }
    fetchData();
  }, []);

  // 3. Hàm xử lý khi bấm nút "+"
  const handleAddTour = async (tourToAdd) => {
    const tourCode = tourToAdd.id; // Dùng id làm tour_code

    // Kiểm tra nhanh xem đã tồn tại trong DB chưa (dựa vào state đã fetch)
    if (dbTourCodes.has(tourCode)) {
       setAddingStatus((prev) => ({ ...prev, [tourCode]: 'exists' }));
       return; // Dừng lại nếu đã tồn tại
    }

    // Đánh dấu là đang xử lý
    setAddingStatus((prev) => ({ ...prev, [tourCode]: 'adding' }));

    // Hiển thị prompt để chọn Nhà cung cấp (nếu có NCC)
    let selectedSupplierId = null;
    if (suppliers.length > 0) {
        const supplierChoice = prompt(
          `Thêm tour "${tourToAdd.title}".\nChọn nhà cung cấp (nhập số):\n` +
          suppliers.map((s, index) => `${index + 1}. ${s.name}`).join('\n') +
          `\n(Bỏ trống nếu không muốn chọn)`
        );

        if (supplierChoice && !isNaN(supplierChoice)) {
          const index = parseInt(supplierChoice, 10) - 1;
          if (index >= 0 && index < suppliers.length) {
            selectedSupplierId = suppliers[index].id;
          }
        }
    } else {
        alert("Chưa có Nhà cung cấp nào được tạo. Tour sẽ được thêm mà không có Nhà cung cấp.");
    }


    // Chuẩn bị dữ liệu để insert
    const productData = {
      name: tourToAdd.title,
      tour_code: tourCode,
      price: tourToAdd.price || 0,
      inventory: tourToAdd.inventory || 10,
      product_type: 'tour',
      supplier_id: selectedSupplierId,
      image_url: tourToAdd.image,
      description: tourToAdd.description,
      duration: tourToAdd.duration,
      location: tourToAdd.location,
      rating: tourToAdd.rating,
    };

    // Thực hiện INSERT
    const { error: insertError } = await supabase
      .from('Products')
      .insert(productData);

    if (insertError) {
      console.error('Lỗi insert tour:', insertError);
      setAddingStatus((prev) => ({ ...prev, [tourCode]: 'error' }));
      alert(`Lỗi khi thêm tour "${tourToAdd.title}": ${insertError.message}`);
    } else {
      // Thêm thành công
      setAddingStatus((prev) => ({ ...prev, [tourCode]: 'added' }));
      // Cập nhật lại Set các tour_code đã có
      setDbTourCodes(prev => new Set(prev).add(tourCode));
    }
  };

  // --- RENDER ---
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Thêm nhanh Tour từ Dữ liệu mẫu
      </h1>

      {loadingSuppliers ? (
         <div className="flex justify-center items-center h-40">
           <FaSpinner className="animate-spin text-3xl text-sky-500 mr-3" />
           <span>Đang tải dữ liệu...</span>
         </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {localTours.map((tour) => {
              const status = addingStatus[tour.id] || (dbTourCodes.has(tour.id) ? 'exists' : 'idle'); // Kiểm tra trạng thái hiện tại hoặc đã tồn tại

              return (
                <li key={tour.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-700">
                  <div className="flex items-center space-x-4">
                    <img
                      src={tour.image || 'https://placehold.co/60x60/eee/ccc?text=Img'}
                      alt={tour.title}
                      className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tour.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID/Code: {tour.id} - Giá: {tour.price?.toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                  </div>

                  {/* Nút Thêm và Trạng thái */}
                  <div className="flex items-center space-x-2">
                     {status === 'idle' && (
                       <button
                         onClick={() => handleAddTour(tour)}
                         className="p-2 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200"
                         title="Thêm vào database"
                       >
                         <FaPlus size={14} />
                       </button>
                     )}
                     {status === 'adding' && (
                       <FaSpinner className="animate-spin text-sky-500" />
                     )}
                     {status === 'added' && (
                       <FaCheckCircle className="text-green-500" title="Đã thêm thành công" />
                     )}
                      {status === 'exists' && (
                       <span className="text-xs text-gray-400 italic" title="Tour này đã có trong database">Đã tồn tại</span>
                     )}
                     {status === 'error' && (
                       <FaExclamationCircle className="text-red-500" title="Có lỗi xảy ra" />
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