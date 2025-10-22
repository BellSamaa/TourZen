import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupabase } from "../lib/supabaseClient";
import { ParallaxBanner, useParallax } from "react-scroll-parallax";
import Slider from "react-slick";
import { FaCreditCard, FaSpinner, FaMapMarkerAlt, FaClock, FaInfoCircle } from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const supabase = getSupabase();

const formatCurrency = (number) => {
    if (typeof number !== "number" || isNaN(number)) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};

// --- Function Slugify ---
function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

// --- Function lấy đường dẫn ảnh ---
const getTourImage = (tour) => {
    if (tour?.galleryImages && tour.galleryImages.length > 0 && tour.galleryImages[0]) { return tour.galleryImages[0]; }
    if (tour?.image_url) { return tour.image_url; }
    if (tour?.name) { const conventionalFileName = `tour-${slugify(tour.name)}.jpg`; return `/images/${conventionalFileName}`; }
    return `https://placehold.co/1200x800/003366/FFFFFF?text=${encodeURIComponent(tour?.name || 'TourZen')}`;
};

// --- Ảnh Placeholder ---
const placeholderImg = 'https://placehold.co/600x400/CCCCCC/FFFFFF?text=Image+Not+Found';


// --- Component con cho Loading ---
const LoadingComponent = () => (
    <div className="flex justify-center items-center min-h-[70vh]">
        <FaSpinner className="animate-spin text-4xl text-sky-500" />
    </div>
); // <-- Đảm bảo có dấu ;

// --- Component con cho Lỗi/Không tìm thấy ---
const ErrorComponent = ({ message }) => (
    <motion.div
        className="flex flex-col justify-center items-center min-h-[70vh] text-center text-xl py-20 px-4 text-red-600 dark:text-red-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
         <FaInfoCircle className="text-4xl mb-4 opacity-50"/>
         <p>{message}</p>
    </motion.div>
); // <-- Đảm bảo có dấu ;

// --- Component Chính ---
const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { ref: bannerRef, scrollYProgress } = useScroll();
    const bannerTextY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    useEffect(() => {
        async function fetchTour() {
            setLoading(true);
            setError(null);
            try { // Thêm try...catch
                const { data, error: fetchError } = await supabase
                    .from("Products")
                    .select("*, supplier_name:Suppliers(name)")
                    .eq("id", id)
                    .single();

                if (fetchError) throw fetchError; // Ném lỗi để catch bắt
                if (data) {
                    setTour(data);
                } else {
                    setError("Tour không tồn tại."); // Set lỗi cụ thể
                    setTour(null);
                }
            } catch (err) {
                 console.error("Lỗi fetch chi tiết tour:", err);
                 // Xử lý lỗi RLS hoặc lỗi mạng cụ thể hơn nếu cần
                 if (err.message.includes('Row level security policy')) {
                    setError("Bạn không có quyền xem tour này hoặc RLS đang bật.");
                 } else {
                     setError("Không thể tải thông tin tour. Vui lòng thử lại.");
                 }
                 setTour(null);
            } finally {
                setLoading(false);
            }
        }
        if (id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) { // Kiểm tra ID là UUID hợp lệ
             fetchTour();
        } else {
             setError("ID tour không hợp lệ.");
             setLoading(false);
        }
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) { return <LoadingComponent />; }
    // Lỗi được xử lý riêng, chỉ cần kiểm tra !tour ở đây
    if (!tour) { return <ErrorComponent message={error || "Tour không tồn tại."} />; }

    // --- Xử lý Ảnh ---
    const mainImageUrl = getTourImage(tour);
    const galleryImages = tour?.galleryImages && tour.galleryImages.length > 0
        ? tour.galleryImages
        : [mainImageUrl]; // Luôn có ít nhất 1 ảnh

    const sliderSettings = {
        dots: true,
        appendDots: dots => ( <div style={{ bottom: "-45px" }}><ul style={{ margin: "0px" }}> {dots} </ul></div> ), // Tăng bottom
        customPaging: i => ( <div className="w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors duration-300 slick-dot-active:bg-sky-500"></div> ), // Giảm size dot
        infinite: galleryImages.length > 1,
        speed: 700, slidesToShow: 1, slidesToScroll: 1,
        autoplay: true, autoplaySpeed: 4500, // Chậm lại chút
        fade: true, pauseOnHover: true,
     };

     const handleBookNow = () => { /* ... giữ nguyên ... */ };

    // --- Animation Variants ---
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }; // Giảm delay
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }; // Giảm y, duration

    return (
        <motion.div
            className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-x-hidden"
            initial="hidden" animate="visible" exit={{ opacity: 0 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }} // Nhanh hơn
        >
            {/* === Banner === */}
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


            {/* === Gallery Slider === */}
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
                {/* --- Cột Thông tin --- */}
                <motion.div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 md:p-10 rounded-2xl shadow-xl border dark:border-slate-700" variants={itemVariants}>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-sky-700 dark:text-sky-400 border-b pb-4 dark:border-slate-600"> Thông tin chi tiết Tour </h2>
                    <div className="space-y-5 text-slate-700 dark:text-slate-300">
                         <div className="flex items-start gap-4"> <FaClock className="text-sky-500 mt-1 flex-shrink-0" size={20} /> <div> <strong className="font-semibold block text-slate-800 dark:text-slate-100">Thời gian:</strong> <span>{tour.duration || 'N/A'}</span> </div> </div>
                         <div className="flex items-start gap-4"> <FaMapMarkerAlt className="text-sky-500 mt-1 flex-shrink-0" size={20} /> <div> <strong className="font-semibold block text-slate-800 dark:text-slate-100">Điểm đến:</strong> <span>{tour.location || 'N/A'}</span> </div> </div>
                         {tour.supplier_name && ( <div className="flex items-start gap-4"> <FaInfoCircle className="text-sky-500 mt-1 flex-shrink-0" size={20} /> <div> <strong className="font-semibold block text-slate-800 dark:text-slate-100">Nhà cung cấp:</strong> <span>{tour.supplier_name}</span> </div> </div> )}
                         <div className="pt-5 mt-5 border-t dark:border-slate-600">
                            <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">Mô tả chi tiết</h3>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed">
                                {tour.description ? ( <p>{tour.description}</p> ) : ( <p className="italic">Chưa có mô tả chi tiết.</p> )}
                            </div>
                         </div>
                    </div>
                </motion.div>

                {/* --- Cột Đặt vé --- */}
                <motion.div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border dark:border-slate-700 lg:sticky lg:top-24 self-start" variants={itemVariants}>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">Giá chỉ từ</p>
                    <p className="text-4xl md:text-5xl font-bold text-red-600 mb-6 pb-6 border-b dark:border-slate-600"> {formatCurrency(tour.price)} </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6"> Nhấn nút bên dưới để tiến hành đặt tour. </p>
                    <motion.button onClick={handleBookNow} className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800 transition-all duration-300 flex items-center justify-center gap-3 transform active:scale-95" whileHover={{ scale: 1.03, y: -3, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
                        <FaCreditCard /> Đặt Tour Ngay
                    </motion.button>
                     <p className="text-xs text-slate-500 mt-4 text-center"> Nhân viên sẽ liên hệ xác nhận sau khi bạn đặt. </p>
                </motion.div>
            </motion.section>

            {/* === Lịch trình === */}
            {tour.itinerary && tour.itinerary.length > 0 && (
                <motion.section className="max-w-4xl mx-auto p-6 md:p-10 mt-8 mb-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                   <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center text-sky-700 dark:text-sky-400"> Lịch Trình Dự Kiến </h2>
                   <div className="relative pl-6 border-l-4 border-sky-300 dark:border-sky-700 space-y-10">
                     {tour.itinerary.map((item, i) => (
                       <motion.div key={i} className="relative pl-10" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}>
                         <div className="absolute top-1 left-[-1.45rem] w-8 h-8 bg-sky-500 border-4 border-white dark:border-slate-800 rounded-full z-10 flex items-center justify-center shadow"> <span className="text-sm font-bold text-white">{i + 1}</span> </div>
                         <h4 className="font-semibold text-lg md:text-xl text-slate-800 dark:text-slate-100 mb-1.5"> {item.includes(':') ? item.split(':')[0] : `Ngày ${i + 1}`} </h4>
                         <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed"> {item.includes(':') ? item.split(':').slice(1).join(':').trim() : item} </p>
                       </motion.div>
                     ))}
                   </div>
                </motion.section>
            )}

            {/* === Bản đồ === */}
            <motion.section className="max-w-5xl mx-auto my-16 px-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center dark:text-white">Vị trí trên Bản đồ</h2>
              <div className="rounded-2xl overflow-hidden shadow-xl border dark:border-slate-700 aspect-video md:aspect-[16/6]">
                <iframe title="map" src={`https://maps.google.com/maps?q=${encodeURIComponent(tour.name + ", " + tour.location)}&output=embed`} width="100%" height="100%" loading="lazy" className="border-0"></iframe>
              </div>
            </motion.section>
        </motion.div>
    );
};

export default TourDetail;