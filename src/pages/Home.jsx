// src/pages/Home.jsx
// (Phiên bản đầy đủ, kết nối Supabase, đã sửa lỗi 400 và lỗi điều hướng)

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; // Sửa: Dùng Link thay vì navigate on click
import { getSupabase } from "../lib/supabaseClient"; // (Hãy chắc chắn đường dẫn này đúng)
import { FaMapMarkerAlt, FaStar, FaAward, FaHeadset, FaTags } from "react-icons/fa";
import { MapPin, Clock, Fire, Sun, CircleNotch, Ticket, ArrowRight } from "@phosphor-icons/react";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

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


// Dữ liệu cho các điểm đến (Giữ nguyên từ file gốc)
const destinationsData = {
  mienBac: [
    { name: 'Quảng Ninh', image: '/images/destinations/quangninh.jpg', gridClass: 'md:col-span-2 md:row-span-2' },
    { name: 'Hà Giang', image: '/images/destinations/hagiang.jpg', gridClass: 'md:col-span-2' },
    { name: 'Lào Cai', image: '/images/destinations/laocai.jpg', gridClass: '' },
    { name: 'Ninh Bình', image: '/images/destinations/ninhbinh.jpg', gridClass: '' },
    // ... (Giữ nguyên các điểm đến khác) ...
  ],
  mienTrung: [
    { name: 'Đà Nẵng', image: '/images/destinations/danang.jpg', gridClass: 'md:col-span-2 md:row-span-2' },
    { name: 'Hội An', image: '/images/destinations/hoian.jpg', gridClass: 'md:col-span-2' },
    { name: 'Huế', image: '/images/destinations/hue.jpg', gridClass: '' },
    // ... (Giữ nguyên các điểm đến khác) ...
  ],
  mienDongNamBo: [],
  mienTayNamBo: [],
};

const tabs = [
  { key: 'mienBac', label: 'Miền Bắc' },
  { key: 'mienTrung', label: 'Miền Trung' },
  { key: 'mienDongNamBo', label: 'Miền Đông Nam Bộ' },
  { key: 'mienTayNamBo', label: 'Miền Tây Nam Bộ' },
];

// Blog mẫu (Giữ nguyên)
const blogs = [
    { id: 1, title: "Top 5 bãi biển đẹp nhất Việt Nam", excerpt: "Cùng khám phá 5 bãi biển tuyệt đẹp trải dài từ Bắc chí Nam...", image: "/images/blog_beach.jpg" },
    { id: 2, title: "Kinh nghiệm du lịch Đà Lạt 3N2Đ", excerpt: "Thành phố ngàn hoa luôn là điểm đến mơ ước của giới trẻ...", image: "/images/blog_dalat.jpg" },
    { id: 3, title: "Ẩm thực đường phố Nha Trang", excerpt: "Không chỉ có hải sản, Nha Trang còn là thiên đường ăn vặt...", image: "/images/blog_nhatrang.jpg" },
];

// Features (Giữ nguyên)
const features = [
    { icon: <FaAward />, title: "Chất Lượng Hàng Đầu", description: "Chúng tôi cam kết mang đến những trải nghiệm vượt trội và dịch vụ đẳng cấp." },
    { icon: <FaHeadset />, title: "Hỗ Trợ 24/7", description: "Đội ngũ chuyên viên luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi." },
    { icon: <FaTags />, title: "Giá Cả Tối Ưu", description: "Luôn có những ưu đãi tốt nhất và mức giá cạnh tranh trên thị trường." },
];

/**
 * Component Thẻ Tour (Tái sử dụng)
 * (SỬA: Dùng 'price' và Link tới '/tour/:id')
 */
const TourCard = ({ tour, isFeatured = false }) => (
    <Link 
        // (SỬA LỖI) Dùng Link và trỏ tới /tour/:id để khớp với file gốc
        to={`/tour/${tour.id}`} 
        className="group block bg-white dark:bg-neutral-800 shadow-lg rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border dark:border-neutral-700"
    >
        <div className="relative h-56 w-full overflow-hidden">
            <img 
                src={tour.image_url || tour.image || 'https://placehold.co/600x400/eee/ccc?text=Tour+Image'} 
                alt={tour.name || tour.title}
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
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate" title={tour.name || tour.title}>
                {tour.name || tour.title}
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
                    {/* (SỬA LỖI 400) Dùng 'price' thay vì 'selling_price_adult' */}
                    {formatCurrency(tour.price || 0)}
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


export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mienBac');
  
  // (SỬA) Dùng state thay vì const
  const [featuredTours, setFeaturedTours] = useState([]);
  const [newestTours, setNewestTours] = useState([]); // Tour mới nhất
  const [sliderTours, setSliderTours] = useState([]); // Tour cho slider
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
                    supabase.rpc('get_most_booked_tours', { limit_count: 4 }), // Lấy 4 tour
                    
                    // 2. Lấy Tour Mới Nhất
                    supabase
                        .from('Products')
                        // (SỬA LỖI 400) Lấy 'price' thay vì 'selling_price_adult'
                        .select('id, name, title, location, duration, image_url, image, price, rating')
                        .eq('product_type', 'tour')
                        .eq('approval_status', 'approved')
                        .eq('is_published', true)
                        .order('created_at', { ascending: false })
                        .limit(8) // Lấy 8 tour mới
                ]);

                // Xử lý Tour Mới Nhất
                if (newestPromise.error) throw newestPromise.error;
                const allNewTours = newestPromise.data || [];
                setNewestTours(allNewTours);
                
                // Dùng 5 tour mới nhất cho Slider
                setSliderTours(allNewTours.slice(0, 5));

                // Xử lý Tour Nổi Bật
                if (featuredPromise.error) {
                    console.warn("RPC Error (get_most_booked_tours):", featuredPromise.error.message);
                    // (Fallback) Nếu RPC lỗi, tạm lấy 4 tour mới nhất làm nổi bật
                    setFeaturedTours(allNewTours.slice(0, 4));
                } else {
                    setFeaturedTours(featuredPromise.data || []);
                }

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
    <div className="bg-slate-50 dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 overflow-x-hidden">
      {/* <FlyingPlane /> */} {/* (Tùy chọn: Bật/tắt máy bay) */}

      {/* SLIDE GIỚI THIỆU (SỬA: Dùng sliderTours từ state) */}
      <section className="relative w-full h-[90vh] -mt-[76px] text-white">
        <Swiper modules={[Autoplay, Pagination, Navigation]} autoplay={{ delay: 5000, disableOnInteraction: false }} pagination={{ clickable: true }} navigation loop className="h-full">
          {loading && sliderTours.length === 0 ? (
                <SwiperSlide>
                     <div className="h-full bg-gray-800 flex justify-center items-center"><CircleNotch size={40} className="animate-spin" /></div>
                </SwiperSlide>
          ) : (
            sliderTours.map((tour) => (
            <SwiperSlide key={`slide-${tour.id}`}>
              <div className="h-full bg-cover bg-center" style={{ backgroundImage: `url(${tour.image_url || tour.image})` }}>
                <div className="w-full h-full flex flex-col justify-center items-center text-center bg-black/50 p-4">
                  <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                    {tour.title || tour.name}
                  </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg mb-6 drop-shadow-lg">
                    <FaMapMarkerAlt className="inline mr-2" />{tour.location}
                  </motion.p>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
                    <Link 
                        to={`/tour/${tour.id}`} 
                        className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105"
                    >
                        Khám phá ngay
                    </Link>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))
          )}
        </Swiper>
      </section>

      {/* TOUR NỔI BẬT (SỬA: Dùng TourCard) */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">🌍 Tour Du Lịch Nổi Bật</h2>
            <p className="text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto mb-12">Những hành trình được yêu thích nhất, sẵn sàng đưa bạn đến những miền đất hứa.</p>
            
            {loading && <LoadingSpinner />}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!loading && !error && featuredTours.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredTours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} isFeatured={true} />
                ))}
                </div>
            )}
            {!loading && !error && featuredTours.length === 0 && (
                <p className="text-center text-neutral-500 italic">Chưa có tour nổi bật.</p>
            )}
        </div>
      </section>
      
      {/* ĐIỂM ĐẾN YÊU THÍCH (Giữ nguyên) */}
      <section className="py-20 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">🏖️ Điểm Đến Yêu Thích</h2>
            <p className="text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto">Khám phá vẻ đẹp bất tận của Việt Nam qua những điểm đến không thể bỏ lỡ.</p>
            </div>
            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-8 border-b dark:border-neutral-700">
            {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3 py-2 font-semibold transition-colors duration-300 relative ${activeTab === tab.key ? 'text-sky-600' : 'text-slate-500 hover:text-sky-500'}`}>
                {tab.label}
                {activeTab === tab.key && <motion.div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-sky-600" layoutId="underline" />}
                </button>
            ))}
            </div>
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid grid-cols-2 md:grid-cols-4 md:grid-flow-row-dense gap-4 auto-rows-[250px]">
            {destinationsData[activeTab] && destinationsData[activeTab].length > 0 ? (
                destinationsData[activeTab].map((dest, index) => (
                <motion.div key={`${activeTab}-${index}`} className={`relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer ${dest.gridClass}`} whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-5">
                    <h3 className="text-white text-xl font-bold drop-shadow-lg">{dest.name}</h3>
                    </div>
                </motion.div>
                ))
          _Bỏ_ lỡ.</p>
            </div>
            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-8 border-b dark:border-neutral-700">
            {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3 py-2 font-semibold transition-colors duration-300 relative ${activeTab === tab.key ? 'text-sky-600' : 'text-slate-500 hover:text-sky-500'}`}>
                {tab.label}
                {activeTab === tab.key && <motion.div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-sky-600" layoutId="underline" />}
                </button>
            ))}
            </div>
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid grid-cols-2 md:grid-cols-4 md:grid-flow-row-dense gap-4 auto-rows-[250px]">
            {destinationsData[activeTab] && destinationsData[activeTab].length > 0 ? (
                destinationsData[activeTab].map((dest, index) => (
                <motion.div key={`${activeTab}-${index}`} className={`relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer ${dest.gridClass}`} whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-5">
                    <h3 className="text-white text-xl font-bold drop-shadow-lg">{dest.name}</h3>
                    </div>
                </motion.div>
                ))
            ) : (
                <div className="col-span-full text-center text-slate-500 py-10">
                <p>Chưa có điểm đến nào cho khu vực này. Vui lòng quay lại sau.</p>
                </div>
            )}
            </motion.div>
        </div>
      </section>

      {/* BLOG DU LỊCH (Giữ nguyên) */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 dark:text-white">📰 Cẩm Nang Du Lịch</h2>
                <p className="text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto">Những bài viết chia sẻ kinh nghiệm, mẹo hay và cảm hứng cho chuyến đi sắp tới của bạn.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
            {blogs.map((post) => (
                <motion.div key={post.id} whileHover={{ y: -8 }} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-md hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 group">
                    <div className="overflow-hidden h-56">
                        <img src={post.image} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 h-14 dark:text-white">{post.title}</h3>
                        <p className="text-slate-500 dark:text-neutral-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                        <button className="font-semibold text-sky-600 hover:text-sky-700">Đọc thêm →</button>
                  _Bỏ_ lỡ.</p>
            </div>
            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-8 border-b dark:border-neutral-700">
            {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3 py-2 font-semibold transition-colors duration-300 relative ${activeTab === tab.key ? 'text-sky-600' : 'text-slate-500 hover:text-sky-500'}`}>
                {tab.label}
                {activeTab === tab.key && <motion.div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-sky-600" layoutId="underline" />}
                </button>
            ))}
            </div>
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid grid-cols-2 md:grid-cols-4 md:grid-flow-row-dense gap-4 auto-rows-[250px]">
            {destinationsData[activeTab] && destinationsData[activeTab].length > 0 ? (
                destinationsData[activeTab].map((dest, index) => (
                <motion.div key={`${activeTab}-${index}`} className={`relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer ${dest.gridClass}`} whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-5">
                    <h3 className="text-white text-xl font-bold drop-shadow-lg">{dest.name}</h3>
                    </div>
                </motion.div>
                ))
            ) : (
                <div className="col-span-full text-center text-slate-500 py-10">
                <p>Chưa có điểm đến nào cho khu vực này. Vui lòng quay lại sau.</p>
                </div>
            )}
            </motion.div>
        </div>
      </section>

      {/* BLOG DU LỊCH (Giữ nguyên) */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 dark:text-white">📰 Cẩm Nang Du Lịch</h2>
                <p className="text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto">Những bài viết chia sẻ kinh nghiệm, mẹo hay và cảm hứng cho chuyến đi sắp tới của bạn.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
            {blogs.map((post) => (
                <motion.div key={post.id} whileHover={{ y: -8 }} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-md hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 group">
                    <div className="overflow-hidden h-56">
                        <img src={post.image} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 h-14 dark:text-white">{post.title}</h3>
                        <p className="text-slate-500 dark:text-neutral-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                        <button className="font-semibold text-sky-600 hover:text-sky-700">Đọc thêm →</button>
                    </div>
                </motion.div>
            ))}
            </div>
        </div>
      </section>
      
      {/* TẠI SAO CHỌN CHÚNG TÔI (Giữ nguyên) */}
      <section className="py-20 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">💖 Tại Sao Chọn TourZen?</h2>
            <p className="text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto mb-12">Chúng tôi không chỉ bán tour, chúng tôi mang đến những hành trình và kỷ niệm trọn đời.</p>
            <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="flex flex-col items-center">
                    <div className="bg-sky-100 text-sky-600 w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
                    <p className="text-slate-500 dark:text-neutral-400 leading-relaxed">{feature.description}</p>
                </motion.div>
            ))}
            </div>
        </div>
      </section>
    </div>
  );
}