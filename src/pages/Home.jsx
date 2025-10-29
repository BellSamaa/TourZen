// src/pages/Home.jsx
// (V2: UI Enhancements, Dynamic Featured Tours - Placeholder Logic - PHIÊN BẢN ĐẦY ĐỦ)

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { getSupabase } from "../lib/supabaseClient";
// import FlyingPlane from "../components/FlyingPlane"; // Cân nhắc dùng lại
import { FaStar, FaAward, FaHeadset, FaTags } from "react-icons/fa";
import { MapPin, CircleNotch, ArrowRight } from "@phosphor-icons/react"; // Dùng Phosphor

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css"; import "swiper/css/pagination"; import "swiper/css/navigation";

const supabase = getSupabase(); // Khởi tạo Supabase

// --- Dữ liệu tĩnh ---
const destinationsData = {
  mienBac: [
    { name: 'Quảng Ninh', image: '/images/destinations/quangninh.jpg', gridClass: 'md:col-span-2 md:row-span-2' },
    { name: 'Hà Giang', image: '/images/destinations/hagiang.jpg', gridClass: 'md:col-span-2' },
    { name: 'Lào Cai', image: '/images/destinations/laocai.jpg', gridClass: '' },
    { name: 'Ninh Bình', image: '/images/destinations/ninhbinh.jpg', gridClass: '' },
    { name: 'Yên Bái', image: '/images/destinations/yenbai.jpg', gridClass: '' },
    { name: 'Sơn La', image: '/images/destinations/sonla.jpg', gridClass: 'md:col-span-2' },
    { name: 'Cao Bằng', image: '/images/destinations/caobang.jpg', gridClass: '' },
    { name: 'Hải Phòng', image: '/images/destinations/haiphong.jpg', gridClass: '' },
    { name: 'Hà Nội', image: '/images/destinations/hanoi.jpg', gridClass: '' },
  ],
  mienTrung: [
    { name: 'Đà Nẵng', image: '/images/destinations/danang.jpg', gridClass: 'md:col-span-2 md:row-span-2' },
    { name: 'Hội An', image: '/images/destinations/hoian.jpg', gridClass: 'md:col-span-2' },
    { name: 'Huế', image: '/images/destinations/hue.jpg', gridClass: '' },
    { name: 'Quy Nhơn', image: '/images/destinations/quynhon.jpg', gridClass: '' },
    { name: 'Nha Trang', image: '/images/destinations/nhatrang_dest.jpg', gridClass: '' },
    { name: 'Phan Thiết', image: '/images/destinations/phanthiet.jpg', gridClass: 'md:col-span-2' },
  ],
  mienDongNamBo: [], // Thêm dữ liệu nếu cần
  mienTayNamBo: [], // Thêm dữ liệu nếu cần
};

const tabs = [
  { key: 'mienBac', label: 'Miền Bắc' },
  { key: 'mienTrung', label: 'Miền Trung' },
  { key: 'mienDongNamBo', label: 'Đông Nam Bộ' },
  { key: 'mienTayNamBo', label: 'Tây Nam Bộ' },
];

const features = [
  { icon: <FaAward />, title: "Chất Lượng Hàng Đầu", description: "Cam kết mang đến những trải nghiệm vượt trội và dịch vụ đẳng cấp." },
  { icon: <FaHeadset />, title: "Hỗ Trợ 24/7", description: "Đội ngũ chuyên viên luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi." },
  { icon: <FaTags />, title: "Giá Cả Tối Ưu", description: "Luôn có những ưu đãi tốt nhất và mức giá cạnh tranh trên thị trường." },
];

const blogs = [
  { id: 1, title: "Top 5 bãi biển đẹp nhất Việt Nam bạn nên ghé thăm mùa hè này", excerpt: "Cùng khám phá 5 bãi biển tuyệt đẹp trải dài từ Bắc chí Nam, hứa hẹn mang đến kỳ nghỉ đáng nhớ...", image: "/images/blog_beach.jpg" },
  { id: 2, title: "Kinh nghiệm du lịch Đà Lạt tự túc 3 ngày 2 đêm chi tiết nhất", excerpt: "Thành phố ngàn hoa luôn là điểm đến mơ ước của giới trẻ, tìm hiểu lịch trình khám phá Đà Lạt...", image: "/images/blog_dalat.jpg" },
  { id: 3, title: "Ăn sập Nha Trang với list món ngon đường phố không thể bỏ lỡ", excerpt: "Không chỉ có hải sản tươi ngon, Nha Trang còn là thiên đường ẩm thực đường phố hấp dẫn...", image: "/images/blog_nhatrang.jpg" },
];
// --- Hết Dữ liệu tĩnh ---

// --- Helper Format Tiền ---
const formatCurrency = (num) => typeof num === "number" ? num.toLocaleString("vi-VN") + '₫' : "Liên hệ";
// --- Hết Helper ---

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mienBac');
  const [featuredTours, setFeaturedTours] = useState([]); // State cho tour động
  const [loadingTours, setLoadingTours] = useState(true);

  // --- Fetch Tour Nổi Bật ---
  useEffect(() => {
    const fetchTopTours = async () => {
      setLoadingTours(true);
      try {
        // TẠM THỜI: Lấy 8 tour mới nhất đã được duyệt và đăng
        // THAY THẾ bằng logic lấy tour bán chạy nhất khi có dữ liệu booking
        const { data, error } = await supabase
          .from('Products')
          .select('id, name, location, duration, image_url, selling_price_adult, rating') // Lấy giá bán
          .eq('product_type', 'tour')
          .eq('approval_status', 'approved')
          .eq('is_published', true)
          .order('created_at', { ascending: false }) // Tạm sort theo mới nhất
          .limit(8);

        if (error) throw error;
        setFeaturedTours(data || []);

      } catch (error) { console.error("Lỗi fetch tour nổi bật:", error); }
      finally { setLoadingTours(false); }
    };
    fetchTopTours();
  }, []);
  // --- Hết Fetch ---

  return (
    <div className="bg-slate-50 dark:bg-neutral-900 text-slate-800 dark:text-slate-200 overflow-x-hidden">
      {/* <FlyingPlane /> */}

      {/* --- Hero Section --- */}
      <section className="relative w-full h-[85vh] md:h-[90vh] -mt-[76px] text-white">
        <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={true}
            loop={!loadingTours && featuredTours.length > 1} // Chỉ loop khi có nhiều hơn 1 slide
            className="h-full home-hero-swiper" // Thêm class để custom navigation/pagination
        >
           {/* Slide Loading */}
           {(loadingTours || featuredTours.length === 0) && (
              <SwiperSlide>
                  <div className="h-full bg-gradient-to-br from-sky-600 to-blue-800 flex items-center justify-center">
                      <CircleNotch size={40} className="animate-spin"/>
                  </div>
              </SwiperSlide>
           )}
           {/* Slides Tour */}
           {featuredTours.slice(0, 5).map((tour) => (
            <SwiperSlide key={`slide-${tour.id}`}>
              <div className="h-full bg-cover bg-center relative" style={{ backgroundImage: `url(${tour.image_url || '/images/default.jpg'})` }}>
                <div className="absolute inset-0 bg-black/50"></div> {/* Overlay */}
                <div className="w-full h-full flex flex-col justify-center items-center text-center p-4 relative z-10">
                  <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"> {tour.name} </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg mb-6 drop-shadow-lg flex items-center gap-2"> <MapPin weight="fill"/>{tour.location || 'Việt Nam'} </motion.p>
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} onClick={() => navigate(`/tour/${tour.id}`)} className="button-hero"> Xem Chi Tiết </motion.button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* --- Tour Nổi Bật --- */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
            <h2 className="section-title">🌍 Tour Du Lịch Nổi Bật</h2>
            <p className="section-subtitle"> Những hành trình bán chạy nhất, sẵn sàng đưa bạn đến những miền đất hứa. </p>
            {loadingTours ? ( <div className="flex justify-center items-center h-60"> <CircleNotch size={32} className="animate-spin text-sky-500"/> </div> )
            : featuredTours.length === 0 ? ( <p className="text-slate-500 italic mt-8">Chưa có tour nổi bật nào.</p> )
            : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-12">
                    {featuredTours.map((tour, i) => (
                        <motion.div
                            key={tour.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.6 }}
                            viewport={{ once: true, amount: 0.3 }}
                            whileHover={{ y: -8 }}
                            className="card-hover-effect" // Dùng class chung
                            onClick={() => navigate(`/tour/${tour.id}`)}
                        >
                            <div className="relative overflow-hidden rounded-t-xl">
                                <img src={tour.image_url || '/images/default.jpg'} alt={tour.name} className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => {e.target.src='/images/default.jpg'}}/>
                                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">{tour.duration || 'N/A'}</div>
                            </div>
                            <div className="p-5 text-left bg-white dark:bg-neutral-800 rounded-b-xl flex flex-col flex-grow">
                                <h3 className="font-semibold text-lg truncate mb-1 text-slate-800 dark:text-white" title={tour.name}>{tour.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-1.5"> <MapPin size={16} className="text-sky-500 flex-shrink-0" /> {tour.location || 'N/A'} </p>
                                <div className="flex justify-between items-end mt-4 pt-3 border-t dark:border-neutral-700">
                                    <span className="text-xl font-bold text-red-600">{formatCurrency(tour.selling_price_adult || tour.price)}</span> {/* Hiển thị giá bán */}
                                    {tour.rating && ( <div className="flex items-center gap-1 text-amber-500"> <FaStar /> <span className="text-slate-600 dark:text-slate-300 font-semibold text-sm">{tour.rating.toFixed(1)}</span> </div> )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
             <motion.button onClick={() => navigate('/tours')} className="button-outline mt-12" whileHover={{ scale: 1.05 }} > Xem tất cả tour <ArrowRight className="inline ml-1"/> </motion.button>
        </div>
      </section>

      {/* --- Điểm Đến --- */}
      <section className="py-16 md:py-24 bg-white dark:bg-neutral-800">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12"> <h2 className="section-title">🏖️ Điểm Đến Yêu Thích</h2> <p className="section-subtitle"> Khám phá vẻ đẹp bất tận của Việt Nam. </p> </div>
            {/* Tabs */}
            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-8 border-b dark:border-neutral-700">
                 {tabs.map((tab) => ( <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}> {tab.label} {activeTab === tab.key && <motion.div className="tab-underline" layoutId="dest-underline" />} </button> ))}
            </div>
            {/* Grid Điểm đến */}
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="grid grid-cols-2 md:grid-cols-4 md:grid-flow-row-dense gap-4 auto-rows-[200px] sm:auto-rows-[250px]">
                {(destinationsData[activeTab]?.length > 0) ? (
                    destinationsData[activeTab].map((dest, index) => (
                        <motion.div
                            key={`${activeTab}-${index}`}
                            className={`relative rounded-xl overflow-hidden shadow-lg group cursor-pointer ${dest.gridClass || ''}`}
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => {e.target.src='/images/default-dest.jpg'}} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-4 md:p-5">
                                <h3 className="text-white text-lg md:text-xl font-bold drop-shadow-lg">{dest.name}</h3>
                            </div>
                            {/* Link ẩn để click */}
                            <Link to={`/tours?destination=${slugify(dest.name)}`} className="absolute inset-0 z-10"></Link>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-slate-500 dark:text-slate-400 py-10 italic"> <p>Chưa có điểm đến nào cho khu vực này.</p> </div>
                )}
            </motion.div>
        </div>
      </section>

      {/* --- Blog --- */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12"> <h2 className="section-title">📰 Cẩm Nang Du Lịch</h2> <p className="section-subtitle"> Kinh nghiệm, mẹo hay và cảm hứng cho chuyến đi. </p> </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {blogs.map((post, index) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -8 }}
                        className="card-hover-effect" // Dùng class chung
                    >
                        <div className="overflow-hidden rounded-t-xl">
                            <img src={post.image} alt={post.title} className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => {e.target.src='/images/default-blog.jpg'}}/>
                        </div>
                        <div className="p-6 bg-white dark:bg-neutral-800 rounded-b-xl">
                            <h3 className="font-semibold text-lg mb-2 h-14 line-clamp-2 text-slate-800 dark:text-white">{post.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                            <Link to={`/blog/${post.id}`} className="font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 group">
                                Đọc thêm <ArrowRight className="transition-transform group-hover:translate-x-1"/>
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* --- Tại Sao Chọn TourZen --- */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-sky-50 to-blue-100 dark:from-neutral-800 dark:to-slate-900">
        <div className="container mx-auto px-4 text-center">
            <h2 className="section-title">💖 Tại Sao Chọn TourZen?</h2> <p className="section-subtitle"> Mang đến những hành trình và kỷ niệm trọn đời. </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
                 {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 shadow-md"> {feature.icon} </div>
                        <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-white">{feature.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                    </motion.div>
                 ))}
             </div>
        </div>
      </section>

      {/* --- Global Styles --- */}
      <style jsx global>{`
        /* Tiêu đề & Phụ đề Section */
        .section-title { @apply text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-white; }
        .section-subtitle { @apply text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 text-base md:text-lg; }
        /* Nút trên Hero */
        .button-hero { @apply bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-black/50; }
        /* Nút Viền */
        .button-outline { @apply border-2 border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white font-semibold px-6 py-2.5 rounded-lg transition-colors duration-300 flex items-center justify-center gap-1; }
        /* Hiệu ứng Card */
        .card-hover-effect { @apply rounded-xl shadow-md hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col group bg-white dark:bg-neutral-800; } /* Thêm bg */
        /* Nút Tab */
        .tab-button { @apply px-3 py-2 font-semibold transition-colors duration-300 relative text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400; }
        .tab-button.active { @apply text-sky-600 dark:text-sky-400; }
        .tab-underline { @apply absolute bottom-[-1px] left-0 right-0 h-0.5 bg-sky-600 dark:bg-sky-400; }

        /* Custom Swiper Navigation/Pagination */
        .home-hero-swiper .swiper-button-prev,
        .home-hero-swiper .swiper-button-next {
          color: white;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          transition: background-color 0.2s;
        }
        .home-hero-swiper .swiper-button-prev:hover,
        .home-hero-swiper .swiper-button-next:hover {
            background-color: rgba(0, 0, 0, 0.5);
        }
        .home-hero-swiper .swiper-button-prev::after,
        .home-hero-swiper .swiper-button-next::after {
          font-size: 18px;
          font-weight: bold;
        }
        .home-hero-swiper .swiper-pagination-bullet {
          background-color: rgba(255, 255, 255, 0.7);
          opacity: 1;
          transition: background-color 0.2s;
          width: 10px;
          height: 10px;
        }
        .home-hero-swiper .swiper-pagination-bullet-active {
          background-color: white;
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}