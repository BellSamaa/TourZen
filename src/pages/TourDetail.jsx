// src/pages/TourDetail.jsx
// (NÂNG CẤP: Đã tích hợp bảng "Departures" mới)

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast"; // <-- THÊM Toaster
import { ParallaxBanner, useParallax } from "react-scroll-parallax";
import Slider from "react-slick";
import { 
    FaCreditCard, FaSpinner, FaMapMarkerAlt, FaClock, FaInfoCircle,
    FaCalendarAlt, FaMoneyBillWave, FaChild, FaUser, FaPlus, FaGift, FaPlane, FaStickyNote,
    FaUsers // <-- THÊM icon
} from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

// --- Component Chính ---
const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [departures, setDepartures] = useState([]); // <-- MỚI: Lưu lịch khởi hành
    const [loading, setLoading] = useState(true);
    const [departuresLoading, setDeparturesLoading] = useState(true); // <-- MỚI: Loading cho lịch
    const [error, setError] = useState(null);
    const [selectedDepartureId, setSelectedDepartureId] = useState(null); // <-- MỚI: ID của lịch đã chọn

    const { ref: bannerRef, scrollYProgress } = useScroll();
    const bannerTextY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    // --- (SỬA) useEffect fetch data ---
    useEffect(() => {
        async function fetchTourAndDepartures() {
            // Kiểm tra ID hợp lệ
            if (!id || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
                 setError("ID tour không hợp lệ.");
                 setLoading(false);
                 setDeparturesLoading(false);
                 return;
            }

            setLoading(true);
            setDeparturesLoading(true);
            setError(null);
            setTour(null);
            setDepartures([]);
            setSelectedDepartureId(null);
            window.scrollTo(0, 0);

            try {
                // Fetch 1: Lấy thông tin Tour
                // (Chỉ lấy tour đã được Duyệt và Đăng)
                const { data: tourData, error: tourError } = await supabase
                    .from("Products")
                    .select("*, supplier_name:Suppliers(name)")
                    .eq("id", id)
                    .eq("is_published", true) // <-- QUAN TRỌNG
                    .eq("approval_status", "approved") // <-- QUAN TRỌNG
                    .single();

                if (tourError || !tourData) {
                    throw new Error("Tour không tồn tại hoặc đã bị ẩn.");
                }
                
                setTour(tourData);
                setLoading(false); // <-- Thông tin chính đã tải xong

                // Fetch 2: Lấy Lịch khởi hành
                const today = new Date().toISOString().split('T')[0];
                const { data: departuresData, error: departuresError } = await supabase
                    .from("Departures")
                    .select("*")
                    .eq("product_id", id)
                    .gte("departure_date", today) // Chỉ lấy các ngày trong tương lai
                    .order("departure_date", { ascending: true });
                
                if (departuresError) throw departuresError;

                setDepartures(departuresData || []);

            } catch (err) {
                 console.error("Lỗi fetch chi tiết tour:", err);
                 setError(err.message || "Không thể tải thông tin tour. Vui lòng thử lại.");
                 setTour(null);
            } finally {
                 setLoading(false); // Đảm bảo loading chính tắt
                 setDeparturesLoading(false); // Tắt loading của lịch
            }
        }
        
        fetchTourAndDepartures();
    }, [id]);

    // --- (MỚI) Tính giá "Từ" thấp nhất ---
    const displayPrice = useMemo(() => {
        if (departuresLoading) return tour?.price || 0; // Hiển thị giá gốc trong khi chờ
        
        // Lọc các lịch còn chỗ
        const available = departures.filter(d => d.max_slots > d.booked_slots);
        
        if (available.length > 0) {
            // Tìm giá người lớn nhỏ nhất
            return Math.min(...available.map(d => d.adult_price));
        }
        
        return tour?.price || 0; // Fallback về giá gốc nếu không có lịch
    }, [departures, departuresLoading, tour]);


    // --- (SỬA) Logic "Đặt Ngay" ---
    const handleBookNow = () => {
        if (!selectedDepartureId) {
            toast.error("Vui lòng chọn một ngày khởi hành bên dưới.");
            // Cuộn tới khu vực chọn lịch
            document.getElementById('departures-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const selectedDeparture = departures.find(d => d.id === selectedDepartureId);
        if (!selectedDeparture) {
            toast.error("Lỗi: Ngày khởi hành đã chọn không hợp lệ.");
            return;
        }
        
        // Kiểm tra lại lần nữa phòng trường hợp data cũ
        if (selectedDeparture.max_slots <= selectedDeparture.booked_slots) {
            toast.error("Ngày khởi hành này đã hết chỗ. Vui lòng chọn ngày khác.");
            setSelectedDepartureId(null); // Reset lựa chọn
            return;
        }

        // Gửi data qua trang Payment
        navigate('/payment', {
            state: {
                item: tour, // Gửi toàn bộ thông tin tour
                selectedDeparture: selectedDeparture // Gửi data LỊCH KHỞI HÀNH đã chọn
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
            className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-x-hidden"
            initial="hidden" animate="visible" exit={{ opacity: 0 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }} 
        >
            <Toaster position="top-center" reverseOrder={false} /> {/* <-- THÊM Toaster */}
            
            {/* === Banner (Giữ nguyên) === */}
            <div ref={bannerRef} className="relative overflow-hidden">
                <ParallaxBanner layers={[{ image: mainImageUrl, speed: -18, props: { onError: (e) => { e.target.onerror = null; e.target.src = placeholderImg } } }]} className="h-[60vh] md:h-[75vh]" >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent " />
                </ParallaxBanner>
                <motion.div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-6 md:p-12 pointer-events-none" style={{ y: bannerTextY }} >
                    <motion.h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-3 drop-shadow-xl leading-tight" variants={itemVariants}>
                        {tour.name}
                    </motion.h1>
                    <motion.p className="text-lg md:text-xl flex items-center gap-2 drop-shadow-lg opacity-90" variants={itemVariants}>
                        <FaMapMarkerAlt /> {tour.location || 'Chưa rõ'}
                    </motion.p>
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

                {/* --- Cột Đặt vé (ĐÃ SỬA GIÁ) --- */}
                <motion.div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border dark:border-slate-700 lg:sticky lg:top-24 self-start" variants={itemVariants}>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">Giá chỉ từ</p>
                    <p className="text-4xl md:text-5xl font-bold text-red-600 mb-6 pb-6 border-b dark:border-slate-600">
                        {/* SỬA: Dùng giá thấp nhất đã tính toán */}
                        {displayPrice > 0 ? formatCurrency(displayPrice) : "Liên hệ"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6"> Chọn lịch khởi hành và giá ở bên dưới, sau đó nhấn "Đặt Tour Ngay". </p>
                    <motion.button onClick={handleBookNow} className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800 transition-all duration-300 flex items-center justify-center gap-3 transform active:scale-95" whileHover={{ scale: 1.03, y: -3, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
                        <FaCreditCard /> Đặt Tour Ngay
                    </motion.button>
                     <p className="text-xs text-slate-500 mt-4 text-center"> Nhân viên sẽ liên hệ xác nhận sau khi bạn đặt. </p>
                </motion.div>
            </motion.section>

            {/* --- (MỚI) LỊCH KHỞI HÀNH & BẢNG GIÁ --- */}
            {/* (Đã xây dựng lại hoàn toàn) */}
            <motion.section 
                id="departures-section" // <-- ID để cuộn tới
                className="max-w-6xl mx-auto p-6 md:p-10 mt-8 mb-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700" 
                initial={{ opacity: 0, y: 50 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-sky-700 dark:text-sky-400"> Chọn Lịch khởi hành </h2>
                
                {/* Trạng thái Loading */}
                {departuresLoading && (
                    <div className="flex justify-center items-center p-10">
                        <FaSpinner className="animate-spin text-3xl text-sky-500" />
                        <p className="ml-3 text-lg text-slate-600 dark:text-slate-400">Đang tải lịch khởi hành...</p>
                    </div>
                )}

                {/* Không có lịch */}
                {!departuresLoading && departures.length === 0 && (
                     <div className="text-center p-10 text-lg text-slate-500 dark:text-slate-400 italic">
                        <FaCalendarAlt className="mx-auto text-4xl mb-4 opacity-50" />
                        Hiện chưa có lịch khởi hành nào cho tour này.
                        <br/>Vui lòng quay lại sau!
                    </div>
                )}

                {/* Danh sách lịch */}
                {!departuresLoading && departures.length > 0 && (
                    <div className="space-y-4">
                        {departures.map(dep => {
                            const remaining = dep.max_slots - dep.booked_slots;
                            const isFull = remaining <= 0;
                            const isSelected = dep.id === selectedDepartureId;

                            return (
                                <motion.div
                                    key={dep.id}
                                    onClick={() => !isFull && setSelectedDepartureId(dep.id)}
                                    className={`
                                        p-5 border-2 rounded-lg transition-all duration-300
                                        ${isFull ? 'bg-slate-100 dark:bg-slate-800 opacity-60 cursor-not-allowed' : 'bg-white dark:bg-slate-700 cursor-pointer hover:shadow-md hover:border-sky-400 dark:hover:bg-slate-600'}
                                        ${isSelected ? 'border-sky-500 shadow-lg bg-sky-50 dark:bg-sky-900/30' : 'border-gray-200 dark:border-slate-600'}
                                    `}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Ngày & Slots */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                {/* Nút radio (giả) */}
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-sky-500 bg-sky-500' : 'border-gray-400 bg-white dark:bg-slate-600'}`}>
                                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                </div>
                                                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                                    {new Date(dep.departure_date + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="ml-8 mt-1.5 flex items-center gap-2 text-sm font-medium">
                                                <FaUsers className={isFull ? 'text-red-500' : 'text-green-600'} />
                                                <span className={isFull ? 'text-red-500' : 'text-green-600'}>
                                                    {isFull ? 'Đã hết chỗ' : `Chỉ còn ${remaining} chỗ`}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Giá */}
                                        <div className="md:text-right ml-8 md:ml-0">
                                            <div className="flex items-center md:justify-end gap-2 text-sm text-slate-600 dark:text-slate-300"><FaUser /> Người lớn</div>
                                            <div className="text-xl font-bold text-red-600 mt-1">{formatCurrency(dep.adult_price)}</div>
                                        </div>
                                        <div className="md:text-right ml-8 md:ml-0">
                                            <div className="flex items-center md:justify-end gap-2 text-sm text-slate-600 dark:text-slate-300"><FaChild /> Trẻ em</div>
                                            <div className="text-lg font-bold text-red-600 mt-1">{formatCurrency(dep.child_price)}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </motion.section>


            {/* === Lịch trình (Giữ nguyên) === */}
            {tour.itinerary && tour.itinerary.length > 0 && (
                <motion.section className="max-w-4xl mx-auto p-6 md:p-10 mt-8 mb-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                   <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center text-sky-700 dark:text-sky-400"> Lịch Trình Dự Kiến </h2>
                   <div className="relative pl-6 border-l-4 border-sky-300 dark:border-sky-700 space-y-10">
                     {tour.itinerary.map((item, i) => (
                        <motion.div key={i} className="relative pl-10" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}>
                          {/* Sửa logic hiển thị tiêu đề/nội dung lịch trình */}
                          <div className="absolute top-1 left-[-1.45rem] w-8 h-8 bg-sky-500 border-4 border-white dark:border-slate-800 rounded-full z-10 flex items-center justify-center shadow"> <span className="text-sm font-bold text-white">{i + 1}</span> </div>
                          <h4 className="font-semibold text-lg md:text-xl text-slate-800 dark:text-slate-100 mb-1.5"> 
                            { (typeof item === 'object' && item.title) ? item.title : `Ngày ${i + 1}` }
                          </h4>
                          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed"> 
                            { (typeof item === 'object' && item.content) ? item.content : (typeof item === 'string' ? item : '') }
                          </p>
                        </motion.div>
                     ))}
                   </div>
                </motion.section>
            )}

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