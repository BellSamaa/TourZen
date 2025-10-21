// src/components/HotelCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { supabase } from '../supabaseClient'; // Import supabase
import toast from 'react-hot-toast'; // Dùng react-hot-toast để thông báo

export default function HotelCard({ hotel }) {
  const [isBooking, setIsBooking] = useState(false);
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(hotel.price) + '₫';

  const handleBooking = async () => {
    setIsBooking(true);
    const loadingToast = toast.loading('Đang xử lý đặt phòng...');

    // 1. Lấy thông tin người dùng đang đăng nhập
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        toast.error('Bạn cần đăng nhập để đặt phòng!');
        setIsBooking(false);
        toast.dismiss(loadingToast);
        return;
    }

    // 2. Chuẩn bị dữ liệu để insert vào bảng 'bookings'
    const bookingData = {
        user_id: user.id,
        item_id: hotel.id,
        item_type: 'hotel',
        item_name: hotel.name,
        total_price: hotel.price
    };

    // 3. Insert vào Supabase
    const { error } = await supabase
        .from('bookings')
        .insert(bookingData);

    toast.dismiss(loadingToast);

    if (error) {
        console.error('Lỗi đặt phòng:', error);
        toast.error(`Đặt phòng thất bại: ${error.message}`);
    } else {
        // Đây là nơi "auto đặt thành công"
        toast.success(`Đặt ${hotel.name} thành công!`);
        // Bạn có thể thêm dữ liệu này vào bảng 'Supplier' như yêu cầu
        // Ví dụ: await supabase.from('Supplier').insert({ ... })
        // Nhưng logic đúng là nên insert vào bảng 'bookings'
    }

    setIsBooking(false);
  };

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      <img src={hotel.image} alt={hotel.name} className="w-full md:w-1/3 h-52 md:h-auto object-cover" />
      <div className="p-4 md:p-6 flex flex-col flex-grow">
        <div>
          <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
            <MapPinIcon className="h-4 w-4 mr-1 text-neutral-400" />
            {hotel.location}
          </div>
          <h3 className="text-xl font-bold text-neutral-800 dark:text-white my-1 hover:text-primary-blue transition-colors">
            <Link to={`/hotel/${hotel.id}`}>{hotel.name}</Link>
          </h3>
          <div className="flex items-center">
            {Array.from({ length: hotel.rating }).map((_, i) => (
              <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
            ))}
            <span className="ml-2 text-xs text-neutral-600 dark:text-neutral-300">({hotel.reviews} đánh giá)</span>
          </div>
        </div>
        <div className="mt-auto pt-4 flex flex-col md:flex-row md:items-end md:justify-between">
            <div className='mb-4 md:mb-0 text-left'>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Giá mỗi đêm từ</span>
                <p className="font-bold text-2xl text-accent-orange-dark">{formattedPrice}</p>
            </div>
            <div className="flex gap-2">
                <Link to={`/hotel/${hotel.id}`} className="inline-block bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                    Xem chi tiết
                </Link>
                <button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="inline-block bg-primary-blue hover:bg-primary-blue-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isBooking ? 'Đang đặt...' : 'Đặt ngay'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}