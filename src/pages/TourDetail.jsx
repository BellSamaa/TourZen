import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupabase } from "../lib/supabaseClient";
import { ParallaxBanner, useParallax } from "react-scroll-parallax"; // Import useParallax
import Slider from "react-slick";
import { FaCreditCard, FaSpinner, FaMapMarkerAlt, FaClock, FaInfoCircle } from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion"; // Import thêm hooks
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const supabase = getSupabase();

const formatCurrency = (number) => { /* ... giữ nguyên ... */ };

// --- Function Slugify --- (Chuyển tên tour thành tên file)
function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Tách dấu
        .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
        .replace(/\s+/g, '-') // Thay khoảng trắng bằng '-'
        .replace(/[^\w-]+/g, '') // Xóa ký tự đặc biệt (trừ '-')
        .replace(/--+/g, '-') // Xóa dấu '--' thừa
        .replace(/^-+/, '') // Xóa '-' đầu
        .replace(/-+$/, ''); // Xóa '-' cuối
}

// --- Function lấy đường dẫn ảnh (Logic mới) ---
const getTourImage = (tour) => {
    // 1. Ưu tiên galleryImages
    if (tour?.galleryImages && tour.galleryImages.length > 0 && tour.galleryImages[0]) {
        return tour.galleryImages[0];
    }
    // 2. Kế đến là image_url
    if (tour?.image_url) {
        return tour.image_url;
    }
    // 3. Thử tạo đường dẫn theo tên tour (ví dụ: /images/tour-ten-tour.jpg)
    if (tour?.name) {
        const conventionalFileName = `tour-${slugify(tour.name)}.jpg`; // Giả sử đuôi .jpg
        return `/images/${conventionalFileName}`;
    }
    // 4. Fallback cuối cùng: ảnh placeholder
    return `https://placehold.co/1200x800/003366/FFFFFF?text=${encodeURIComponent(tour?.name || 'TourZen')}`;
};


// --- Component con cho Loading ---
const LoadingComponent = () => ( /* ... giữ nguyên ... */ );

// --- Component con cho Lỗi/Không tìm thấy (Đã sửa căn giữa) ---
const ErrorComponent = ({ message }) => (
    <motion.div
        className="flex flex-col justify-center items-center min-h-[70vh] text-center text-xl py-20 px-4 text-red-600 dark:text-red-400" // Thêm flex-col, px-4
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
         <FaInfoCircle className="text-4xl mb-4 opacity-50"/>
         <p>{message}</p>
    </motion.div>
);

const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Parallax cho Banner Text ---
    const { ref: bannerRef, scrollYProgress } = useScroll(); // Dùng hook useScroll
    const bannerTextY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]); // Di chuyển text chậm hơn khi scroll

    useEffect(() => { /* ... fetchTour logic giữ nguyên ... */ }, [id]);

    if (loading) { return <LoadingComponent />; }
    if (error || !tour) { return <ErrorComponent message={error || "Tour không tồn tại."} />; }

    // --- Xử lý Ảnh (Logic mới) ---
    const mainImageUrl = getTourImage(tour); // Lấy ảnh chính theo logic mới
    const galleryImages = tour?.galleryImages && tour.galleryImages.length > 0
        ? tour.galleryImages
        : [mainImageUrl]; // Gallery chỉ chứa ảnh chính nếu ko có galleryImages

    const sliderSettings = {
        dots: true,
        appendDots: dots => ( /* ... giữ nguyên ... */ ),
        customPaging: i => ( /* ... giữ nguyên ... */ ),
        infinite: galleryImages.length > 1,
        speed: 700,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        fade: true,
        pauseOnHover: true,
     };

     const handleBookNow = () => {
         const itemToPurchase = {
            tourId: tour.id,
            title: tour.name,
            priceAdult: tour.price,
            priceChild: (tour.price / 2) || 0,
            priceInfant: 0,
            image: mainImageUrl, // Dùng ảnh chính đã xác định
            location: tour.location || "",
            adults: 1, children: 0, infants: 0,
            key: `${tour.id}-default`, month: 'any', departureDates: [],
         };
         navigate("/payment", { state: { items: [itemToPurchase] } });
     };

    // --- Animation Variants ---
    const containerVariants = { /* ... giữ nguyên ... */ };
    const itemVariants = { /* ... giữ nguyên ... */ };

    // --- Ảnh Placeholder mặc định cho onError ---
    const placeholderImg = 'https://placehold.co/600x400/CCCCCC/FFFFFF?text=Image+Error';

    return (
        <motion.div
            className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-x-hidden" // Thêm overflow-x-hidden
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } }}
        >
            {/* === Banner === */}
            <div ref={bannerRef} className="relative overflow-hidden"> {/* Thêm div bao ngoài để lấy ref */}
                <ParallaxBanner
                    layers={[{
                        // Dùng ảnh chính đã xác định, thêm onError
                        image: mainImageUrl,
                        speed: -18, // Điều chỉnh tốc độ parallax
                        props: { onError: (e) => { e.target.onerror = null; e.target.src = placeholderImg } } // Thêm onError vào props của layer
                    }]}
                    className="h-[60vh] md:h-[75vh]" // Tăng chiều cao
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent " /> {/* Lớp phủ */}
                </ParallaxBanner>
                {/* Text di chuyển theo parallax */}
                <motion.div
                    className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-6 md:p-12 pointer-events-none" // Thêm pointer-events-none
                    style={{ y: bannerTextY }} // Áp dụng hiệu ứng parallax Y
                 >
                    <motion.h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-3 drop-shadow-xl leading-tight" variants={itemVariants}>
                        {tour.name}
                    </motion.h1>
                    <motion.p className="text-lg md:text-xl flex items-center gap-2 drop-shadow-lg opacity-90" variants={itemVariants}>
                        <FaMapMarkerAlt /> {tour.location || 'Chưa rõ'}
                    </motion.p>
                </motion.div>
            </div>


            {/* === Gallery Slider === */}
            <motion.section
               className="max-w-6xl mx-auto py-12 px-4 -mt-24 md:-mt-40 relative z-10" // Tăng py, giảm mt
               variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800">
                <Slider {...sliderSettings}>
                  {galleryImages.map((src, i) => (
                    <div key={i}>
                      <img
                        src={src || placeholderImg} // Thêm fallback nếu src trong mảng bị null/undefined
                        alt={`${tour.name} - ảnh ${i + 1}`}
                        className="h-[400px] md:h-[650px] object-cover w-full" // Tăng chiều cao
                        onError={(e) => { e.target.onerror = null; e.target.src=placeholderImg }} // Thêm onError
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            </motion.section>

            {/* === Thông tin chính & Đặt vé === */}
            <motion.section
                className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 px-4 mt-8 mb-16" // Tăng mb, lg:gap-12
                variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            >
                {/* --- Cột Thông tin --- */}
                <motion.div
                    className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 md:p-10 rounded-2xl shadow-xl border dark:border-slate-700" // Tăng padding
                    variants={itemVariants}
                >
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-sky-700 dark:text-sky-400 border-b pb-4 dark:border-slate-600"> {/* Tăng mb, pb */}
                        Thông tin chi tiết Tour
                    </h2>
                    <div className="space-y-5 text-slate-700 dark:text-slate-300"> {/* Tăng space */}
                         <div className="flex items-start gap-4"> {/* Tăng gap */}
                            <FaClock className="text-sky-500 mt-1 flex-shrink-0" size={20} /> {/* Tăng size icon */}
                            <div>
                                <strong className="font-semibold block text-slate-800 dark:text-slate-100">Thời gian:</strong>
                                <span>{tour.duration || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <FaMapMarkerAlt className="text-sky-500 mt-1 flex-shrink-0" size={20} />
                             <div>
                                <strong className="font-semibold block text-slate-800 dark:text-slate-100">Điểm đến:</strong>
                                <span>{tour.location || 'N/A'}</span>
                            </div>
                        </div>
                         {tour.supplier_name && (
                            <div className="flex items-start gap-4">
                                <FaInfoCircle className="text-sky-500 mt-1 flex-shrink-0" size={20} />
                                 <div>
                                    <strong className="font-semibold block text-slate-800 dark:text-slate-100">Nhà cung cấp:</strong>
                                    <span>{tour.supplier_name}</span>
                                </div>
                            </div>
                         )}
                        <div className="pt-4 mt-5 border-t dark:border-slate-600"> {/* Thêm pt, mt */}
                            <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">Mô tả chi tiết</h3>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed"> {/* Dùng prose đẹp hơn */}
                                {tour.description ? (
                                    <p>{tour.description}</p> // Render description trong <p> nếu có
                                ) : (
                                    <p className="italic">Chưa có mô tả chi tiết.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* --- Cột Đặt vé --- */}
                <motion.div
                    className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border dark:border-slate-700 lg:sticky lg:top-24 self-start"
                    variants={itemVariants}
                >
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">Giá chỉ từ</p>
                    <p className="text-4xl md:text-5xl font-bold text-red-600 mb-6 pb-6 border-b dark:border-slate-600">
                        {formatCurrency(tour.price)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                        Nhấn nút bên dưới để tiến hành đặt tour.
                    </p>
                    {/* //TODO: Thêm lại phần chọn tháng khi có dữ liệu */}

                    <motion.button
                        onClick={handleBookNow}
                        className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800 transition-all duration-300 flex items-center justify-center gap-3 transform active:scale-95" // Thêm active:scale-95
                        whileHover={{ scale: 1.03, y: -3, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                    >
                        <FaCreditCard />
                        Đặt Tour Ngay
                    </motion.button>
                     <p className="text-xs text-slate-500 mt-4 text-center">
                        Nhân viên sẽ liên hệ xác nhận sau khi bạn đặt.
                    </p>
                </motion.div>
            </motion.section>

            {/* === Lịch trình === */}
            {tour.itinerary && tour.itinerary.length > 0 && ( /* ... JSX lịch trình giữ nguyên ... */ )}

            {/* === Bản đồ === */}
            <motion.section /* ... JSX bản đồ giữ nguyên ... */ >
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center dark:text-white">Vị trí trên Bản đồ</h2>
                 <div className="rounded-2xl overflow-hidden shadow-xl border dark:border-slate-700 aspect-video md:aspect-[16/6]"> {/* Giảm chiều cao 1 chút */}
                    <iframe /* ... */ height="100%" ></iframe>
                 </div>
            </motion.section>
        </motion.div>
    );
};

export default TourDetail;