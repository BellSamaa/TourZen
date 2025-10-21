// src/pages/TourDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupabase } from "../lib/supabaseClient";
import { ParallaxBanner } from "react-scroll-parallax";
import Slider from "react-slick";
import { FaCreditCard, FaSpinner, FaMapMarkerAlt, FaClock, FaInfoCircle } from "react-icons/fa"; // Thêm icons
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const supabase = getSupabase();

const formatCurrency = (number) => {
    if (typeof number !== "number" || isNaN(number)) return "Liên hệ"; // Sửa lỗi NaN
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};

const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchTour() {
            setLoading(true);
            setError(null);
            const { data, error: fetchError } = await supabase
                .from("Products")
                // Lấy thêm tên NCC nếu có
                .select("*, supplier_name:Suppliers(name)")
                .eq("id", id)
                .single();

            if (fetchError) {
                console.error("Lỗi fetch chi tiết tour:", fetchError);
                setError("Không thể tải thông tin tour.");
                setTour(null);
            } else if (data) {
                setTour(data);
            } else {
                setTour(null); // Không tìm thấy
            }
            setLoading(false);
        }
        if (id) { fetchTour(); }
        else { setError("ID tour không hợp lệ."); setLoading(false); }
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) { /* ... Loading spinner ... */ }
    if (error || !tour) { /* ... Error/Not Found message ... */ }

    const galleryImages = tour?.galleryImages && tour.galleryImages.length > 0
        ? tour.galleryImages
        : tour.image_url ? [tour.image_url] : ['/images/default.jpg'];

    const sliderSettings = { /* ... sliderSettings ... */ };

     const handleBookNow = () => {
         const itemToPurchase = { /* ... itemToPurchase logic ... */ };
         navigate("/payment", { state: { items: [itemToPurchase] } });
     };

    return (
        <motion.div
            className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200" // Nền mới
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* === Banner === */}
            <ParallaxBanner
                layers={[{ image: tour.image_url || "/images/default.jpg", speed: -15 }]} // Giảm speed
                className="h-[50vh] md:h-[65vh] relative"
            >
                {/* Lớp phủ tối hơn để chữ rõ hơn */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end items-center text-white text-center p-6 md:p-12">
                    <motion.h1
                        className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-lg leading-tight" // Font đậm hơn
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        {tour.name}
                    </motion.h1>
                    <motion.p
                        className="text-lg md:text-xl flex items-center gap-2 drop-shadow-md"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <FaMapMarkerAlt /> {tour.location || 'Chưa rõ'}
                    </motion.p>
                </div>
            </ParallaxBanner>

            {/* === Gallery Slider === */}
            <motion.section
               className="max-w-6xl mx-auto py-10 px-4 -mt-16 md:-mt-24 relative z-10" // Tăng max-w
               initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                <Slider {...sliderSettings}>
                  {galleryImages.map((src, i) => (
                    <div key={i}>
                      <img
                        src={src}
                        alt={`${tour.name} - ảnh ${i + 1}`}
                        className="h-[350px] md:h-[600px] object-cover w-full" // Tăng chiều cao
                        onError={(e) => { e.target.onerror = null; e.target.src="/images/default.jpg" }}
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            </motion.section>

            {/* === Thông tin chính & Đặt vé === */}
            <motion.section
                className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 mt-8 mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ staggerChildren: 0.1 }}
            >
                {/* --- Cột Thông tin --- */}
                <motion.div
                    className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg"
                    variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold mb-5 text-sky-700 dark:text-sky-400 border-b pb-3 dark:border-slate-700">
                        Thông tin chi tiết Tour
                    </h2>
                    <div className="space-y-4 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-3">
                            <FaClock className="text-sky-500" size={18} />
                            <span><strong>Thời gian:</strong> {tour.duration || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FaMapMarkerAlt className="text-sky-500" size={18} />
                            <span><strong>Điểm đến:</strong> {tour.location || 'N/A'}</span>
                        </div>
                         {/* Hiển thị tên NCC nếu có */}
                         {tour.supplier_name && (
                            <div className="flex items-center gap-3">
                                <FaInfoCircle className="text-sky-500" size={18} />
                                <span><strong>Nhà cung cấp:</strong> {tour.supplier_name}</span>
                            </div>
                         )}
                        <h3 className="text-xl font-semibold mt-6 mb-2 text-slate-800 dark:text-slate-100">Mô tả</h3>
                        <p className="leading-relaxed text-base">
                            {tour.description || "Chưa có mô tả chi tiết."}
                        </p>
                    </div>
                </motion.div>

                {/* --- Cột Đặt vé --- */}
                <motion.div
                    className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg lg:sticky lg:top-24 self-start" // Thêm sticky
                    variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } }}
                >
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">Giá chỉ từ</p>
                    <p className="text-4xl md:text-5xl font-bold text-red-600 mb-6 pb-6 border-b dark:border-slate-700">
                        {formatCurrency(tour.price)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
                        Chọn tháng và ngày khởi hành để xem giá chính xác và đặt tour.
                    </p>
                    {/* //TODO: Thêm lại phần chọn tháng khi có dữ liệu */}
                    {/* <div className="mb-5"> <SelectMonthComponent data={tour.departure_info} /> </div> */}

                    <motion.button
                        onClick={handleBookNow}
                        className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 transition-all duration-300 flex items-center justify-center gap-3"
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                    >
                        <FaCreditCard />
                        Đặt Tour Ngay
                    </motion.button>
                     <p className="text-xs text-slate-500 mt-3 text-center">
                        Nhân viên sẽ liên hệ xác nhận sau khi bạn đặt.
                    </p>
                </motion.div>
            </motion.section>

            {/* === Lịch trình === */}
            {tour.itinerary && tour.itinerary.length > 0 && (
                <motion.section
                    className="max-w-4xl mx-auto p-6 md:p-8 mt-8 mb-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg"
                    initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                >
                   <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-sky-700 dark:text-sky-400">
                       Lịch Trình Dự Kiến
                   </h2>
                   <div className="relative pl-6 border-l-2 border-sky-200 dark:border-sky-800 space-y-8">
                     {/* Đường line dọc */}
                     <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-sky-500 to-transparent -translate-x-[1px]"></div>

                     {tour.itinerary.map((item, i) => (
                       <motion.div
                           key={i}
                           className="relative pl-8"
                           initial={{ opacity: 0, x: -20 }}
                           whileInView={{ opacity: 1, x: 0 }}
                           viewport={{ once: true }}
                           transition={{ duration: 0.5, delay: i * 0.1 }}
                       >
                         {/* Chấm tròn trên timeline */}
                         <div className="absolute top-1 left-[-1.1rem] w-6 h-6 bg-white dark:bg-slate-800 border-4 border-sky-500 rounded-full z-10 flex items-center justify-center">
                            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{i + 1}</span>
                         </div>
                         {/* Nội dung */}
                         <h4 className="font-semibold text-lg md:text-xl text-slate-800 dark:text-slate-100 mb-1">
                           {/* Cố gắng tách Ngày và Tiêu đề (nếu có dấu ':') */}
                           {item.includes(':') ? item.split(':')[0] : `Ngày ${i + 1}`}
                         </h4>
                         <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                           {item.includes(':') ? item.split(':').slice(1).join(':').trim() : item}
                         </p>
                       </motion.div>
                     ))}
                   </div>
                </motion.section>
            )}

            {/* === Bản đồ === */}
            <motion.section
                className="max-w-5xl mx-auto my-12 p-5" // Tăng max-w
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-semibold mb-5 text-center dark:text-white">Vị trí trên Bản đồ</h2>
              <div className="rounded-2xl overflow-hidden shadow-xl border dark:border-slate-700">
                <iframe
                  title="map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(tour.name + ", " + tour.location)}&output=embed`}
                  width="100%"
                  height="400" // Tăng chiều cao bản đồ
                  loading="lazy"
                  className="border-0"
                ></iframe>
              </div>
            </motion.section>

        </motion.div>
    );
};

export default TourDetail;

// --- Loading và Error Components (nếu bạn muốn tách ra) ---
// const LoadingComponent = () => (
//   <div className="flex justify-center items-center min-h-[70vh]">
//     <FaSpinner className="animate-spin text-4xl text-sky-500" />
//   </div>
// );
// const ErrorComponent = ({ message }) => (
//   <motion.div className="text-center text-xl py-20 text-red-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//     {message}
//   </motion.div>
// );