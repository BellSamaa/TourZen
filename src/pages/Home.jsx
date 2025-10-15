import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TOURS } from "../data/tours";
import FlyingPlane from "../components/FlyingPlane";
import { FaMapMarkerAlt, FaStar, FaAward, FaHeadset, FaTags } from "react-icons/fa";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Dữ liệu cho các điểm đến
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
  mienDongNamBo: [],
  mienTayNamBo: [],
};

const tabs = [
  { key: 'mienBac', label: 'Miền Bắc' },
  { key: 'mienTrung', label: 'Miền Trung' },
  { key: 'mienDongNamBo', label: 'Miền Đông Nam Bộ' },
  { key: 'mienTayNamBo', label: 'Miền Tây Nam Bộ' },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mienBac');

  // Lấy ra 8 tour nổi bật (có thể thay đổi logic tùy ý)
  const featuredTours = TOURS.slice(0, 8);
  
  // Lọc ra 4 tour bán chạy nhất (dựa trên flag isBestseller trong data)
  const bestsellingTours = TOURS.filter(tour => tour.isBestseller).slice(0, 4);

  // Dữ liệu cho mục "Tại sao chọn chúng tôi"
  const features = [
    { icon: <FaAward />, title: "Chất Lượng Hàng Đầu", description: "Chúng tôi cam kết mang đến những trải nghiệm vượt trội và dịch vụ đẳng cấp." },
    { icon: <FaHeadset />, title: "Hỗ Trợ 24/7", description: "Đội ngũ chuyên viên luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi." },
    { icon: <FaTags />, title: "Giá Cả Tối Ưu", description: "Luôn có những ưu đãi tốt nhất và mức giá cạnh tranh trên thị trường." },
  ];
  
  // Blog mẫu
  const blogs = [
    { id: 1, title: "Top 5 bãi biển đẹp nhất Việt Nam", excerpt: "Cùng khám phá 5 bãi biển tuyệt đẹp trải dài từ Bắc chí Nam...", image: "/images/blog_beach.jpg" },
    { id: 2, title: "Kinh nghiệm du lịch Đà Lạt 3N2Đ", excerpt: "Thành phố ngàn hoa luôn là điểm đến mơ ước của giới trẻ...", image: "/images/blog_dalat.jpg" },
    { id: 3, title: "Ẩm thực đường phố Nha Trang", excerpt: "Không chỉ có hải sản, Nha Trang còn là thiên đường ăn vặt...", image: "/images/blog_nhatrang.jpg" },
  ];

  return (
    <div className="bg-slate-50 text-slate-800 overflow-x-hidden">
      <FlyingPlane />

      {/* SLIDE GIỚI THIỆU */}
      <section className="relative w-full h-[90vh] -mt-[76px] text-white">
        <Swiper modules={[Autoplay, Pagination, Navigation]} autoplay={{ delay: 5000, disableOnInteraction: false }} pagination={{ clickable: true }} navigation loop className="h-full">
          {featuredTours.slice(0, 5).map((tour) => (
            <SwiperSlide key={tour.id}>
              <div className="h-full bg-cover bg-center" style={{ backgroundImage: `url(${tour.image})` }}>
                <div className="w-full h-full flex flex-col justify-center items-center text-center bg-black/50 p-4">
                  <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                    {tour.title || tour.name}
                  </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg mb-6 drop-shadow-lg">
                    <FaMapMarkerAlt className="inline mr-2" />{tour.location}
                  </motion.p>
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} onClick={() => navigate(`/tour/${tour.id}`)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105">
                    Xem Chi Tiết
                  </motion.button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* TOUR NỔI BẬT */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">🌍 Tour Du Lịch Nổi Bật</h2>
            <p className="text-slate-500 max-w-2xl mx-auto mb-12">Những hành trình được yêu thích nhất, sẵn sàng đưa bạn đến những miền đất hứa.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredTours.map((tour) => (
                <motion.div key={tour.id} whileHover={{ y: -8 }} className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300" onClick={() => navigate(`/tour/${tour.id}`)}>
                    <div className="relative">
                        <img src={tour.image} alt={tour.title} className="h-56 w-full object-cover" />
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">{tour.duration}</div>
                    </div>
                    <div className="p-5 text-left">
                        <h3 className="font-semibold text-lg truncate">{tour.title}</h3>
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-blue-500" /> {tour.location}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-xl font-bold text-red-600">{tour.price.toLocaleString("vi-VN")}₫</span>
                            <div className="flex items-center gap-1 text-amber-500">
                                <FaStar /> <span className="text-slate-600 font-semibold">{tour.rating}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
            </div>
        </div>
      </section>

      {/* TẠI SAO CHỌN CHÚNG TÔI */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">💖 Tại Sao Chọn TourZen?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto mb-12">Chúng tôi không chỉ bán tour, chúng tôi mang đến những hành trình và kỷ niệm trọn đời.</p>
            <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="flex flex-col items-center">
                    <div className="bg-blue-100 text-blue-600 w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                </motion.div>
            ))}
            </div>
        </div>
      </section>
      
      {/* ĐIỂM ĐẾN YÊU THÍCH */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🏖️ Điểm Đến Yêu Thích</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Khám phá vẻ đẹp bất tận của Việt Nam qua những điểm đến không thể bỏ lỡ.</p>
            </div>
            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-8 border-b">
            {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3 py-2 font-semibold transition-colors duration-300 relative ${activeTab === tab.key ? 'text-blue-600' : 'text-slate-500 hover:text-blue-500'}`}>
                {tab.label}
                {activeTab === tab.key && <motion.div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600" layoutId="underline" />}
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

      {/* BLOG DU LỊCH */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">📰 Cẩm Nang Du Lịch</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">Những bài viết chia sẻ kinh nghiệm, mẹo hay và cảm hứng cho chuyến đi sắp tới của bạn.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
            {blogs.map((post) => (
                <motion.div key={post.id} whileHover={{ y: -8 }} className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 group">
                    <div className="overflow-hidden">
                        <img src={post.image} alt={post.title} className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 h-14">{post.title}</h3>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                        <button className="font-semibold text-blue-600 hover:text-blue-700">Đọc thêm →</button>
                    </div>
                </motion.div>
            ))}
            </div>
        </div>
      </section>
      
      {/* TOUR BÁN CHẠY NHẤT (ĐÃ DI CHUYỂN XUỐNG CUỐI) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">🔥 Tour Bán Chạy Nhất</h2>
            <p className="text-slate-500 max-w-2xl mx-auto mb-12">Đừng bỏ lỡ cơ hội trải nghiệm những chuyến đi hot nhất đã được kiểm chứng bởi hàng ngàn khách hàng.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestsellingTours.map((tour) => (
                <motion.div key={tour.id} whileHover={{ y: -8 }} className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300" onClick={() => navigate(`/tour/${tour.id}`)}>
                    <div className="relative">
                        <img src={tour.image} alt={tour.title} className="h-56 w-full object-cover" />
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">{tour.duration}</div>
                    </div>
                    <div className="p-5 text-left">
                        <h3 className="font-semibold text-lg truncate">{tour.title}</h3>
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-blue-500" /> {tour.location}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-xl font-bold text-red-600">{tour.price.toLocaleString("vi-VN")}₫</span>
                            <div className="flex items-center gap-1 text-amber-500">
                                <FaStar /> <span className="text-slate-600 font-semibold">{tour.rating}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
            </div>
        </div>
      </section>
    </div>
  );
}