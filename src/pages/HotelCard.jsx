// src/components/HotelCard.jsx
import React from 'react'; // Bỏ useState vì không cần nữa
import { Link } from 'react-router-dom';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid'; // Giữ nguyên icon
// 1. Import useAuth và icon Edit
import { useAuth } from "../context/AuthContext";
import { FaEdit } from "react-icons/fa";
// 2. KHÔNG import supabase trực tiếp ở đây

// Giữ nguyên hàm format tiền
const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
};

// 3. Thêm prop onEdit
export default function HotelCard({ hotel, onEdit }) {
    // 4. Lấy trạng thái admin
    const { isAdmin } = useAuth();
    // Lấy giá và format (thêm kiểm tra null)
    const formattedPrice = formatCurrency(hotel?.price);

    // 5. Bỏ hàm handleBooking và state isBooking

    // Đảm bảo hotel có dữ liệu cơ bản
    if (!hotel) return null;

    return (
        <div className="flex flex-col bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full relative group"> {/* Thêm relative và group */}

            {/* 6. THÊM NÚT EDIT CHO ADMIN */}
            {isAdmin && onEdit && (
                <button
                    onClick={() => onEdit(hotel)}
                    className="absolute top-3 right-3 z-20 bg-sky-600 text-white p-2.5 rounded-full shadow-lg hover:bg-sky-700 transition-transform transform hover:scale-110"
                    title="Chỉnh sửa Khách sạn"
                >
                    <FaEdit size={14} />
                </button>
            )}

            {/* Link bao quanh ảnh và phần text */}
            <Link to={`/hotel/${hotel.id}`} className="flex flex-col flex-grow"> {/* Giả sử link chi tiết */}
                {/* 7. Sửa hotel.image thành hotel.image_url */}
                <img
                    src={hotel.image_url || '/images/default-hotel.jpg'} // Dùng ảnh mặc định nếu không có
                    alt={hotel.name || 'Khách sạn'}
                    className="w-full h-52 object-cover group-hover:scale-105 transition-transform" // Bỏ md:w-1/3, md:h-auto
                    onError={(e) => { e.target.onerror = null; e.target.src="/images/default-hotel.jpg" }} // Thêm fallback nếu ảnh lỗi
                />
                <div className="p-4 md:p-6 flex flex-col flex-grow"> {/* Thống nhất padding */}
                    <div>
                        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                            <MapPinIcon className="h-4 w-4 mr-1 text-neutral-400 flex-shrink-0" />
                            {/* Thêm kiểm tra hotel.location */}
                            <span>{hotel.location || 'Chưa rõ vị trí'}</span>
                        </div>
                        {/* Thêm kiểm tra hotel.name */}
                        <h3 className="text-xl font-bold text-neutral-800 dark:text-white my-1 group-hover:text-sky-600 transition-colors line-clamp-2">
                           {hotel.name || 'Khách sạn chưa đặt tên'}
                        </h3>
                        {/* Rating (kiểm tra hotel.rating) */}
                        {hotel.rating && hotel.rating > 0 && (
                            <div className="flex items-center mt-1">
                                {Array.from({ length: Math.floor(hotel.rating) }).map((_, i) => (
                                    <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                                ))}
                                {/* Bỏ phần reviews vì chưa có */}
                                {/* <span className="ml-2 text-xs text-neutral-600 dark:text-neutral-300">({hotel.reviews} đánh giá)</span> */}
                                <span className="ml-2 text-xs text-neutral-600 dark:text-neutral-300">{hotel.rating.toFixed(1)} sao</span>
                            </div>
                        )}
                    </div>
                    {/* Phần giá và nút */}
                    <div className="mt-auto pt-4 flex items-end justify-between">
                        <div className='text-left'>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">Giá mỗi đêm từ</span>
                            <p className="font-bold text-2xl text-accent-orange-dark">{formattedPrice}</p>
                        </div>
                        {/* 8. Sửa nút "Đặt ngay" thành "Xem chi tiết" (như nút bên cạnh) */}
                        <button
                           onClick={(e) => { e.preventDefault(); navigate(`/hotel/${hotel.id}`); }} // Dùng navigate khi click
                           className="inline-block bg-primary-blue hover:bg-primary-blue-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                           Xem chi tiết
                        </button>
                         {/* Bỏ nút "Xem chi tiết" cũ */}
                    </div>
                </div>
            </Link> {/* Đóng Link */}
        </div>
    );
}