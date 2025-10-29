// src/pages/Home.jsx
// (Phiên bản đầy đủ, chuyên nghiệp, đã sửa lỗi 'slugify' và 'formatCurrency')

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase } from '../lib/supabaseClient'; // (Hãy chắc chắn đường dẫn này đúng)
import { MapPin, Clock, Star, Fire, ArrowRight, Sun, CircleNotch, Ticket } from '@phosphor-icons/react';
import { FaSpinner } from 'react-icons/fa'; // Icon Tải

const supabase = getSupabase();

// ===================================
// === (SỬA LỖI) CÁC HÀM HELPER ===
// ===================================

/**
 * Chuyển đổi văn bản thành dạng "slug" (URL-friendly).
 */
function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase()
    .normalize('NFD') // Chuẩn hóa Unicode (tách dấu)
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
    .replace(/đ/g, 'd') // Xử lý chữ 'đ'
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng gạch nối
    .replace(/[^\w-]+/g, '') // Bỏ ký tự không phải chữ/số/gạch nối
    .replace(/--+/g, '-') // Bỏ gạch nối thừa
    .replace(/^-+/, '') // Bỏ gạch nối đầu
    .replace(/-+$/, ''); // Bỏ gạch nối cuối
}

/**
 * Định dạng số thành tiền tệ Việt Nam (VND).
 */
const formatCurrency = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
};
// ===================================
// === KẾT THÚC CODE SỬA LỖI ===
// ===================================


/**
 * Component Thẻ Tour (Tái sử dụng)
 */
const TourCard = ({ tour, isFeatured = false }) => (
    <Link 
        // (SỬA LỖI) Dùng hàm slugify đã định nghĩa ở trên
        to={`/tours/${slugify(tour.name)}`} 
        // Gửi state chứa tourId để trang chi tiết có thể fetch
        state={{ tourId: tour.id }} 
        className="group block bg-white dark:bg-neutral-800 shadow-lg rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border dark:border-neutral-700"
    >
        <div className="relative h-56 w-full overflow-hidden">
            <img 
                src={tour.image_url || 'https://placehold.co/600x400/eee/ccc?text=Tour+Image'} 
                alt={tour.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/eee/ccc?text=No+Image'; }}
            />
            {/* Badge Nổi bật */}
            {isFeatured && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Fire size={14} weight="bold" />
                    Nổi Bật
                </div>
            )}
             {/* Badge Địa điểm */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <MapPin size={14} />
                {tour.location || 'Việt Nam'}
            </div>
        </div>
        
        <div className="p-5 space-y-3">
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate" title={tour.name}>
                {tour.name}
            </h3>
            
            <div className="flex justify-between items-center text-sm text-neutral-600 dark:text-neutral-400">
                <span className="flex items-center gap-1.5">
                    <Clock size={16} className="text-sky-500" />
                    {tour.duration || 'N/A ngày'}
                </span>
                <span className="flex items-center gap-1.5">
                    <Star size={16} className="text-yellow-500" />
                    {tour.rating?.toFixed(1) || '4.5'}
                </span>
            </div>

            <div className="pt-3 border-t dark:border-neutral-700 flex justify-between items-center">
                <p className="text-xs text-neutral-500">Giá chỉ từ</p>
                <p className="text-2xl font-extrabold text-red-600">
                    {/* (SỬA LỖI) Dùng hàm formatCurrency đã định nghĩa */}
                    {formatCurrency(tour.selling_price_adult || 0)}
                </p>
            </div>
        </div>
    </Link>
);


/**
 * Component Spinner Tải
 */
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <CircleNotch size={40} className="animate-spin text-sky-600" />
        <span className="ml-3 text-lg text-neutral-600 dark:text-neutral-400">Đang tải dữ liệu...</span>
    </div>
);


/**
 * Component Hero Section (Banner)
 */
const HeroSection = () => (
    <div className="relative h-[60vh] min-h-[400px] max-h-[600px] w-full flex items-center justify-center text-center px-4">
        {/* Lớp ảnh nền */}
        <div className="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop" // 
                alt="Hero Background" 
                className="h-full w-full object-cover"
            />
            {/* Lớp phủ mờ */}
            <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        {/* Lớp nội dung */}
        <div className="relative z-10 space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight shadow-lg">
                Khám Phá Hành Trình Mới
            </h1>
            <p className="text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto">
                TourZen mang đến những trải nghiệm du lịch tuyệt vời nhất, từ bãi biển thơ mộng đến núi non hùng vĩ.
            </p>
            <div>
                <Link 
                    to="/tours" 
                    className="inline-flex items-center gap-2 bg-sky-600 text-white font-semibold px-8 py-3 rounded-full text-lg transform transition-all hover:bg-sky-700 hover:scale-105 shadow-lg"
                >
                    Xem tất cả Tour
                    <ArrowRight size={20} weight="bold" />
                </Link>
            </div>
        </div>
    </div>
);


/**
 * Component Chính: Home
 */
export default function Home() {
    const [featuredTours, setFeaturedTours] = useState([]);
    const [newestTours, setNewestTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHomePageData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Chạy song song 2 luồng fetch
                const [featuredPromise, newestPromise] = await Promise.all([
                    // 1. Lấy Tour Nổi Bật (Mua nhiều nhất)
                    supabase.rpc('get_most_booked_tours', { limit_count: 3 }),
                    
                    // 2. Lấy Tour Mới Nhất
                    supabase
                        .from('Products')
                        .select('id, name, location, duration, image_url, selling_price_adult, rating')
                        .eq('product_type', 'tour')
                        .eq('approval_status', 'approved')
                        .eq('is_published', true)
                        .order('created_at', { ascending: false })
                        .limit(6)
                ]);

                // Xử lý Tour Nổi Bật
                if (featuredPromise.error) {
                    console.warn("RPC Error (get_most_booked_tours):", featuredPromise.error.message);
                    // (Fallback) Nếu RPC lỗi, tạm lấy tour mới nhất làm nổi bật
                    setFeaturedTours(newestPromise.data?.slice(0, 3) || []);
                } else {
                    setFeaturedTours(featuredPromise.data || []);
                }

                // Xử lý Tour Mới Nhất
                if (newestPromise.error) throw newestPromise.error;
                setNewestTours(newestPromise.data || []);

            } catch (err) {
                console.error("Lỗi tải dữ liệu trang chủ:", err);
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchHomePageData();
    }, []);

    return (
        <div className="space-y-16 md:space-y-24 pb-16 bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
            
            {/* === 1. Hero Section === */}
            <HeroSection />

            {/* === 2. Tour Nổi Bật === */}
            <section className="container mx-auto px-4 md:px-6">
                <div className="mb-8 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-white flex items-center justify-center md:justify-start gap-2">
                        <Fire className="text-red-500" /> Tour Nổi Bật
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-2">
                        Các hành trình được yêu thích và đặt nhiều nhất.
                    </p>
                </div>
                
                {loading && <LoadingSpinner />}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && featuredTours.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {featuredTours.map(tour => (
                            <TourCard key={tour.id} tour={tour} isFeatured={true} />
                        ))}
                    </div>
                )}
                {!loading && !error && featuredTours.length === 0 && (
                    <p className="text-center text-neutral-500 italic">Chưa có tour nổi bật.</p>
                )}
            </section>

            {/* === 3. Tour Mới Nhất === */}
            <section className="container mx-auto px-4 md:px-6">
                <div className="mb-8 text-center md:text-left">
                     <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-white flex items-center justify-center md:justify-start gap-2">
                        <Sun className="text-yellow-500" /> Khám Phá Tour Mới
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-2">
                        Những hành trình mới vừa được ra mắt.
                    </p>
                </div>
                
                {loading && newestTours.length === 0 && <LoadingSpinner />}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && newestTours.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {newestTours.map(tour => (
                            <TourCard key={tour.id} tour={tour} />
                        ))}
                    </div>
                )}
                 {!loading && !error && newestTours.length === 0 && (
                    <p className="text-center text-neutral-500 italic">Chưa có tour mới nào được đăng.</p>
                )}
            </section>

             {/* === 4. Lời kêu gọi (Call to Action) === */}
             <section className="container mx-auto px-4 md:px-6">
                <div className="bg-gradient-to-r from-sky-600 to-blue-700 dark:from-sky-700 dark:to-blue-800 rounded-2xl shadow-xl p-10 md:p-16 text-center text-white overflow-hidden relative">
                    <Ticket size={128} className="absolute -top-4 -right-8 text-white/10 opacity-50 rotate-12" />
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Bạn đã sẵn sàng cho chuyến đi?</h2>
                    <p className="text-lg text-blue-100 max-w-xl mx-auto mb-8">
                        Đừng chần chừ! Hãy xem tất cả các tour tuyệt vời chúng tôi cung cấp và tìm hành trình hoàn hảo cho bạn ngay hôm nay.
                    </p>
                    <Link 
                        to="/tours" 
                        className="inline-flex items-center gap-2 bg-white text-sky-700 font-bold px-8 py-3 rounded-full text-lg transform transition-all hover:bg-neutral-100 hover:scale-105 shadow-lg"
                    >
                        Khám Phá Ngay
                    </Link>
                </div>
             </section>
        </div>
    );
}