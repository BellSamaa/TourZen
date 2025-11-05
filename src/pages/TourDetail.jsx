// src/pages/TourDetail.jsx
// (V7: Thêm thống kê % đánh giá sao)

import React, { useState, useEffect, useLayoutEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { ParallaxBanner, useParallax } from "react-scroll-parallax";
import Slider from "react-slick";
import { 
    FaCreditCard, FaSpinner, FaMapMarkerAlt, FaClock, FaInfoCircle,
    FaCalendarAlt, FaMoneyBillWave, FaChild, FaUser, FaPlus, FaGift, FaPlane, FaStickyNote,
    FaUsers, FaStar, FaRegStar, FaUserCircle 
} from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// (LƯU Ý: Không import TourReviews.jsx ở đây, vì chúng ta sửa component ReviewsSection nội bộ)

const supabase = getSupabase();

const formatCurrency = (number) => {
    if (typeof number !== "number" || isNaN(number)) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};

// --- Function Slugify (Giữ nguyên) ---
function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

// --- Function lấy đường dẫn ảnh (Giữ nguyên) ---
const getTourImage = (tour) => {
    if (tour?.galleryImages && tour.galleryImages.length > 0 && tour.galleryImages[0]) { return tour.galleryImages[0]; }
    if (tour?.image_url) { return tour.image_url; }
    if (tour?.name) { const conventionalFileName = `tour-${slugify(tour.name)}.jpg`; return `/images/${conventionalFileName}`; }
    return `https://placehold.co/1200x800/003366/FFFFFF?text=${encodeURIComponent(tour?.name || 'TourZen')}`;
};

// --- Ảnh Placeholder (Giữ nguyên) ---
const placeholderImg = 'https://placehold.co/600x400/CCCCCC/FFFFFF?text=Image+Not+Found';


// --- Component con cho Loading (Giữ nguyên) ---
const LoadingComponent = () => (
    <div className="flex justify-center items-center min-h-[70vh]">
        <FaSpinner className="animate-spin text-4xl text-sky-500" />
    </div>
); 

// --- Component con cho Lỗi/Không tìm thấy (Giữ nguyên) ---
const ErrorComponent = ({ message }) => (
    <motion.div
        className="flex flex-col justify-center items-center min-h-[70vh] text-center text-xl py-20 px-4 text-red-600 dark:text-red-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
       <FaInfoCircle className="text-4xl mb-4 opacity-50"/>
       <p>{message}</p>
    </motion.div>
); 

// --- (MỚI) Component hiển thị thanh % (Thêm bên ngoài) ---
const RatingBar = ({ label, percentage }) => (
    <div className="flex items-center gap-2 text-sm">
        <span className="w-12 text-slate-500 dark:text-slate-400">{label}</span>
        <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-2.5 overflow-hidden">
            <div 
                className="bg-amber-400 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
        <span className="w-10 text-right font-medium text-slate-700 dark:text-slate-300">{percentage.toFixed(0)}%</span>
    </div>
);

// --- Component Hiển thị Sao (Giữ nguyên) ---
const StarRating = ({ rating, size = "text-lg" }) => {
    const totalStars = 5;
    const displayRating = Math.round((rating || 0) * 2) / 2;

    return (
        <div className={`flex items-center gap-0.5 text-amber-400 ${size}`}>
            {[...Array(totalStars)].map((_, i) => (
                i + 1 <= displayRating ? <FaStar key={i} /> : <FaRegStar key={i} />
            ))}
        </div>
    );
};

// --- (ĐÃ SỬA) Component Mục Đánh giá ---
const ReviewsSection = ({ tourId, initialRating }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalReviews, setTotalReviews] = useState(0);

    // (MỚI) State cho thống kê %
    const [stats, setStats] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    useEffect(() => {
        if (!tourId) return;

        async function fetchReviews() {
            setLoading(true);
            setError(null);
            try {
                // Fetch 1: Lấy 10 review mới nhất để hiển thị (như cũ)
                const { data, error: fetchError, count } = await supabase
                    .from("Reviews")
                    .select(`
                        id,
                        created_at,
                        rating,
                        comment
                    `, { count: 'exact' }) // Thêm 'count'
                    .eq("product_id", tourId)
                    .order("created_at", { ascending: false })
                    .limit(10); // Chỉ lấy 10 review mới nhất

                if (fetchError) throw fetchError;
                
                setReviews(data || []);
                const totalCount = count || 0;
                setTotalReviews(totalCount); // Lưu tổng số

                // (MỚI) Fetch 2: Lấy TẤT CẢ ratings để tính toán thống kê
                if (totalCount > 0) {
                    const { data: allRatingsData, error: statsError } = await supabase
                        .from("Reviews")
                        .select("rating") // Chỉ cần cột rating
                        .eq("product_id", tourId);

                    if (statsError) {
                        console.error("Lỗi tải thống kê ratings:", statsError);
                    } else if (allRatingsData) {
                        const newStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                        allRatingsData.forEach(r => {
                            // Đảm bảo rating là số hợp lệ
                            if (r.rating >= 1 && r.rating <= 5) {
                                newStats[r.rating]++;
                            }
                        });
                        setStats(newStats);
                    }
                } else {
                    // Reset nếu không có review
                     setStats({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
                }

            } catch (err) {
                console.error("Lỗi tải reviews:", err);
                setError("Không thể tải đánh giá.");
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, [tourId]);

    const averageRating = parseFloat(initialRating) || 0; // Lấy từ cột Product.rating

    // (MỚI) Hàm tính %
    const getPercentage = (ratingCount) => {
        if (totalReviews === 0) return 0;
        return (ratingCount / totalReviews) * 100;
    };

    return (
        <motion.section 
            className="max-w-4xl mx-auto p-6 md:p-10 my-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-sky-700 dark:text-sky-400">
                Đánh giá từ Khách hàng
            </h2>

            {/* (ĐÃ SỬA) Khu vực tổng quan VÀ thống kê % */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                {/* Cột 1: Điểm trung bình */}
                <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-600 pb-4 md:pb-0 md:pr-6">
                    <span className="text-5xl font-extrabold text-slate-800 dark:text-white">
                        {averageRating.toFixed(1)} / 5
                    </span>
                    <StarRating rating={averageRating} size="text-3xl" />
                    <span className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Dựa trên {totalReviews} đánh giá
                    </span>
                </div>
                
                {/* (MỚI) Cột 2: Thanh % */}
                <div className="md:col-span-2 flex flex-col justify-center space-y-2 pt-4 md:pt-0">
                    <RatingBar label="5 Sao" percentage={getPercentage(stats[5])} />
                    <RatingBar label="4 Sao" percentage={getPercentage(stats[4])} />
                    <RatingBar label="3 Sao" percentage={getPercentage(stats[3])} />
                    <RatingBar label="2 Sao" percentage={getPercentage(stats[2])} />
                    <RatingBar label="1 Sao" percentage={getPercentage(stats[1])} />
                </div>
            </div>


            {/* Danh sách review */}
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
                Bình luận chi tiết ({reviews.length > 0 ? `${reviews.length} mới nhất` : '...'})
            </h3>
            <div className="space-y-6">
                {loading && <div className="text-center"><FaSpinner className="animate-spin text-2xl text-sky-500 mx-auto" /></div>}
                {error && <div className="text-center text-red-500">{error}</div>}
                
                {!loading && !error && reviews.length === 0 && (
                    <p className="text-center text-slate-500 italic">Chưa có đánh giá nào cho tour này.</p>
                )}

                {reviews.map(review => (
                    <motion.div 
                        key={review.id} 
                        className="pb-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <FaUserCircle className="text-2xl text-slate-400" />
                                <span className="font-semibold text-slate-800 dark:text-white">
                                    {"Khách ẩn danh"}
                                </span>
                            </div>
                            <StarRating rating={review.rating} size="text-base" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed pl-8">
                            {review.comment}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-right mt-2">
                            {new Date(review.created_at).toLocaleDateString("vi-VN")}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
};


// --- Component Chính ---
const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { ref: bannerRef, scrollYProgress } = useScroll();
    const bannerTextY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    // --- (FIX V5) useLayoutEffect cuộn trang khi ID thay đổi ---
    useLayoutEffect(() => {
        if (id) {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [id]);

    // --- (SỬA V4) useEffect fix lỗi không tự tải lại ---
    useEffect(() => {
        // --- 1. RESET STATE NGAY LẬP TỨC ---
        setLoading(true);
        setError(null);
        setTour(null);
        // window.scrollTo(0, 0); // Đã chuyển lên useLayoutEffect (FIX V5)

        // --- 2. HÀM FETCH DATA ---
        async function fetchTour() {
            if (!id || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
                 setError("ID tour không hợp lệ.");
                 setLoading(false);
                 return;
            }
            
            try {
                // Fetch 1: Lấy thông tin Tour
                const { data: tourData, error: tourError } = await supabase
                    .from("Products")
                    .select("*, rating, price, supplier_name:Suppliers(name)") // Lấy cột rating và price
                    .eq("id", id)
                    .eq("is_published", true)
                    .eq("approval_status", "approved")
                    .single();

                if (tourError || !tourData) {
                    throw new Error("Tour không tồn tại hoặc đã bị ẩn.");
                }
                setTour(tourData);

            } catch (err) {
                 console.error("Lỗi fetch chi tiết tour:", err);
                 setError(err.message || "Không thể tải thông tin tour. Vui lòng thử lại.");
                 setTour(null);
            } finally {
                 setLoading(false);
            }
        }
        
        fetchTour();
    }, [id]); // Chạy lại mỗi khi ID thay đổi

    // =================================================================
    // === SỬA LỖI LOGIC (V6): Parse mảng 'text[]' (itinerary)
    // =================================================================
    const parsedItinerary = useMemo(() => {
        if (!tour?.itinerary || !Array.isArray(tour.itinerary)) {
            return [];
        }
        return tour.itinerary.map((item, i) => {
            if (typeof item === 'string') {
                try {
                    // Thử parse chuỗi JSON
                    const parsedItem = JSON.parse(item);
                    return {
                        title: parsedItem.title || `Ngày ${i + 1}`,
                        content: parsedItem.content || ''
                    };
                } catch (e) {
                    // Lỗi parse! Có thể là dữ liệu cũ hỏng, hoặc
                    // là dữ liệu rất cũ (chỉ là chuỗi nội dung)
                    if (item && !item.trim().startsWith('{')) {
                        // Nếu không bắt đầu bằng '{', giả sử nó là nội dung
                        return { title: `Ngày ${i + 1}`, content: item };
                    }
                    // Nếu là chuỗi JSON hỏng, trả về lỗi
                    return { title: `Ngày ${i + 1}`, content: '[Lịch trình lỗi, vui lòng liên hệ]' };
                }
            } else if (typeof item === 'object' && item !== null) {
                // Hỗ trợ nếu dữ liệu là 'jsonb'
                return {
                    title: item.title || `Ngày ${i + 1}`,
                    content: item.content || ''
                };
            }
            return { title: `Ngày ${i + 1}`, content: '' };
        });
    }, [tour?.itinerary]);


    // --- (SỬA v3) Dùng 'price' ---
    const displayPrice = tour?.price || 0;

    // --- (SỬA) Logic "Đặt Ngay" ---
    const handleBookNow = () => {
        // Gửi data qua trang Payment
        navigate('/payment', {
            state: {
                item: tour, // Gửi toàn bộ thông tin tour
            }
        });
    };
    // --- KẾT THÚC SỬA ---

    if (loading) { return <LoadingComponent />; }
    if (!tour) { return <ErrorComponent message={error || "Tour không tồn tại."} />; }

    // --- Xử lý Ảnh (Giữ nguyên) ---
    const mainImageUrl = getTourImage(tour);
    const galleryImages = tour?.galleryImages && tour.galleryImages.length > 0
        ? tour.galleryImages
        : [mainImageUrl]; // Luôn có ít nhất 1 ảnh

    const sliderSettings = {
        dots: true,
        appendDots: dots => ( <div style={{ bottom: "-45px" }}><ul style={{ margin: "0px" }}> {dots} </ul></div> ), 
        customPaging: i => ( <div className="w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors duration-300 slick-dot-active:bg-sky-500"></div> ), 
        infinite: galleryImages.length > 1,
        speed: 700, slidesToShow: 1, slidesToScroll: 1,
        autoplay: true, autoplaySpeed: 4500, 
        fade: true, pauseOnHover: true,
     };

    // --- Animation Variants (Giữ nguyên) ---
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }; 
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }; 

    return (
        <motion.div
            key={id} // (SỬA MỚI) Thêm key={id} để force remount component khi ID thay đổi, tránh lỗi white screen khi navigate client-side
            className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-x-hidden"
            initial="hidden" animate="visible" // Xóa exit để tránh vấn đề animation khi không có AnimatePresence
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }} 
        >
            <Toaster position="top-center" reverseOrder={false} />
            
            {/* === Banner (SỬA: Thêm rating) === */}
            <div ref={bannerRef} className="relative overflow-hidden">
                <ParallaxBanner layers={[{ image: mainImageUrl, speed: -18, props: { onError: (e) => { e.target.onerror = null; e.target.src = placeholderImg } } }]} className="h-[60vh] md:h-[75vh]" >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent " />
                </ParallaxBanner>
                <motion.div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-6 md:p-12 pointer-events-none" style={{ y: bannerTextY }} >
                    <motion.h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-3 drop-shadow-xl leading-tight" variants={itemVariants}>
                        {tour.name}
                    </motion.h1>
                    <motion.div className="flex items-center gap-4 drop-shadow-lg opacity-90" variants={itemVariants}>
                        <p className="text-lg md:text-xl flex items-center gap-2">
                            <FaMapMarkerAlt /> {tour.location || 'Chưa rõ'}
                        </p>
                        {/* (MỚI) Hiển thị rating trung bình */}
                        {tour.rating > 0 && (
                            <div className="flex items-center gap-1.5 text-amber-400">
                                <FaStar />
                                <span className="text-lg md:text-xl font-bold text-white">{parseFloat(tour.rating).toFixed(1)}</span>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>


            {/* === Gallery Slider (Giữ nguyên) === */}
            <motion.section className="max-w-6xl mx-auto py-10 px-4 -mt-24 md:-mt-40 relative z-10" variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800">
                <Slider {...sliderSettings}>
                  {galleryImages.map((src, i) => (
                    <div key={i}>
                      <img src={src || placeholderImg} alt={`${tour.name} - ảnh ${i + 1}`} className="h-[400px] md:h-[650px] object-cover w-full" onError={(e) => { e.target.onerror = null; e.target.src=placeholderImg }} />
                    </div>
                  ))}
                </Slider>
              </div>
            </motion.section>

            {/* === Thông tin chính & Đặt vé === */}
            <motion.section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 px-4 mt-10 mb-16" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                
                {/* --- Cột Thông tin (Giữ nguyên) --- */}
                <motion.div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 md:p-10 rounded-2xl shadow-xl border dark:border-slate-700" variants={itemVariants}>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-sky-700 dark:text-sky-400 border-b pb-4 dark:border-slate-600"> Thông tin chi tiết Tour </h2>
                    <div className="space-y-5 text-slate-700 dark:text-slate-300">
                        <div className="flex items-start gap-4"> <FaClock className="text-sky-500 mt-1 flex-shrink-0" size={20} /> <div> <strong className="font-semibold block text-slate-800 dark:text-slate-100">Thời gian:</strong> <span>{tour.duration || 'N/A'}</span> </div> </div>
                        <div className="flex items-start gap-4"> <FaMapMarkerAlt className="text-sky-500 mt-1 flex-shrink-0" size={20} /> <div> <strong className="font-semibold block text-slate-800 dark:text-slate-100">Điểm đến:</strong> <span>{tour.location || 'N/A'}</span> </div> </div>
                        {tour.supplier_name && ( <div className="flex items-start gap-4"> <FaInfoCircle className="text-sky-500 mt-1 flex-shrink-0" size={20} /> <div> <strong className="font-semibold block text-slate-800 dark:text-slate-100">Nhà cung cấp:</strong> 
                            <span>{tour.supplier_name?.name}</span> 
                        </div> </div> )}
                        <div className="pt-5 mt-5 border-t dark:border-slate-600">
                            <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">Mô tả chi tiết</h3>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed">
                                {tour.description ? ( <p>{tour.description}</p> ) : ( <p className="italic">Chưa có mô tả chi tiết.</p> )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* --- Cột Đặt vé (Giữ nguyên) --- */}
                <motion.div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border dark:border-slate-700 lg:sticky lg:top-24 self-start" variants={itemVariants}>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">Giá chỉ từ</p>
                    <p className="text-4xl md:text-5xl font-bold text-red-600 mb-6 pb-6 border-b dark:border-slate-600">
                        {/* (SỬA v3) Dùng displayPrice (tức price) */}
                        {displayPrice > 0 ? formatCurrency(displayPrice) : "Liên hệ"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                        Bạn sẽ chọn ngày khởi hành và số lượng khách ở bước tiếp theo.
                    </p>
                    <motion.button onClick={handleBookNow} className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800 transition-all duration-300 flex items-center justify-center gap-3 transform active:scale-95" whileHover={{ scale: 1.03, y: -3, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
                        <FaCreditCard /> Đặt Tour Ngay
                    </motion.button>
                     <p className="text-xs text-slate-500 mt-4 text-center"> Nhân viên sẽ liên hệ xác nhận sau khi bạn đặt. </p>
                </motion.div>
            </motion.section>

            {/* === Lịch trình (ĐÃ SỬA) === */}
            {parsedItinerary.length > 0 && (
                <motion.section className="max-w-4xl mx-auto p-6 md:p-10 mt-8 mb-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                   <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center text-sky-700 dark:text-sky-400"> Lịch Trình Dự Kiến </h2>
                   <div className="relative pl-6 border-l-4 border-sky-300 dark:border-sky-700 space-y-10">
                     
                     {/* Dùng mảng parsedItinerary đã xử lý */}
                     {parsedItinerary.map((item, i) => (
                        <motion.div key={i} className="relative pl-10" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}>
                          
                          <div className="absolute top-1 left-[-1.45rem] w-8 h-8 bg-sky-500 border-4 border-white dark:border-slate-800 rounded-full z-10 flex items-center justify-center shadow"> <span className="text-sm font-bold text-white">{i + 1}</span> </div>
                          <h4 className="font-semibold text-lg md:text-xl text-slate-800 dark:text-slate-100 mb-1.5"> 
                            {item.title} {/* Hiển thị title đã parse */}
                          </h4>
                          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed"> 
                            {item.content} {/* Hiển thị content đã parse */}
                          </p>
                        </motion.div>
                     ))}
                   </div>
                </motion.section>
            )}

            {/* === (ĐÃ SỬA) Mục Đánh giá === */}
            {/* Truyền tour.id (UUID) và tour.rating (số) vào */}
            <ReviewsSection tourId={tour.id} initialRating={tour.rating} />

            {/* === Bản đồ (Giữ nguyên) === */}
            <motion.section className="max-w-5xl mx-auto my-16 px-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center dark:text-white">Vị trí trên Bản đồ</h2>
              <div className="rounded-2xl overflow-hidden shadow-xl border dark:border-slate-700 aspect-video md:aspect-[16/6]">
                <iframe 
                    title="map" 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(tour.name + ", " + (tour.location || ''))}&output=embed`} 
                    width="100%" 
                    height="100%" 
                    loading="lazy" 
                    className="border-0">
                </iframe>
              </div>
            </motion.section>
        </motion.div>
    );
};

export default TourDetail;