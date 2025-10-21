// src/pages/TourDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// --- 1. Import Supabase ---
import { getSupabase } from "../lib/supabaseClient";
import { ParallaxBanner } from "react-scroll-parallax";
import Slider from "react-slick";
import { FaCreditCard, FaSpinner } from "react-icons/fa"; // Bỏ các icon không dùng
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// --- 2. Khởi tạo Supabase ---
const supabase = getSupabase();

const formatCurrency = (number) => {
  if (typeof number !== "number") return "N/A";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};

const TourDetail = () => {
  const { id } = useParams(); // id này là UUID từ Supabase
  const navigate = useNavigate();

  // --- 3. State để lưu tour từ database ---
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 4. useEffect để fetch dữ liệu từ Supabase ---
  useEffect(() => {
    async function fetchTour() {
      setLoading(true);
      setError(null);

      // Lấy dữ liệu từ bảng Products dựa trên ID (uuid) từ URL
      const { data, error: fetchError } = await supabase
        .from("Products")
        .select("*") // Lấy tất cả các cột
        .eq("id", id) // Lọc theo cột 'id' (UUID)
        .single(); // Chỉ lấy 1 kết quả

      if (fetchError) {
        console.error("Lỗi fetch chi tiết tour:", fetchError);
        setError("Không thể tải thông tin tour.");
        setTour(null); // Đảm bảo tour là null nếu lỗi
      } else if (data) {
        setTour(data);
      } else {
        // Không tìm thấy dữ liệu (ID không tồn tại trong DB)
        setTour(null);
      }
      setLoading(false);
    }

    // Chỉ fetch nếu id hợp lệ (là UUID)
    if (id) {
       fetchTour();
    } else {
       setError("ID tour không hợp lệ.");
       setLoading(false);
    }

    window.scrollTo(0, 0);
  }, [id]); // Chạy lại khi ID trên URL thay đổi

  // --- 5. Xử lý trạng thái Loading ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <FaSpinner className="animate-spin text-4xl text-sky-500" />
      </div>
    );
  }

  // --- 6. Xử lý trạng thái Lỗi hoặc Không tìm thấy ---
  if (error || !tour) {
    return (
      <motion.div
        className="text-center text-xl py-20 text-red-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {error || "Tour không tồn tại."}
      </motion.div>
    );
  }

  // --- 7. Hiển thị thông tin tour (đã fetch được) ---

  // Xử lý gallery images (ưu tiên galleryImages, nếu không có thì dùng image_url)
  const galleryImages = tour?.galleryImages && tour.galleryImages.length > 0
    ? tour.galleryImages
    : tour.image_url ? [tour.image_url] : ['/images/default.jpg']; // Ảnh mặc định

  const sliderSettings = {
    dots: true,
    infinite: galleryImages.length > 1,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
  };

  // --- 8. Logic nút "Đặt Tour Ngay" (đã đơn giản hóa) ---
  //    (Logic chọn tháng phức tạp cần CSDL hỗ trợ, tạm thời bỏ qua)
  const handleBookNow = () => {
    // Tạo item dựa trên dữ liệu tour đã fetch
    const itemToPurchase = {
      // Dùng tên thuộc tính khớp với CartContext của bạn
      tourId: tour.id, // ID là UUID
      title: tour.name,
      priceAdult: tour.price,
      priceChild: (tour.price / 2) || 0, // Giá trẻ em tạm tính = 50%
      priceInfant: 0,
      image: tour.image_url || "/images/default.jpg",
      location: tour.location || "",
      // Các thông tin khác CartContext cần
      adults: 1, // Mặc định 1 người lớn
      children: 0,
      infants: 0,
      key: `${tour.id}-default`, // Key tạm thời
      month: 'any', // Tháng tạm thời
      departureDates: [], // Ngày khởi hành tạm thời
    };

    // Chuyển đến trang payment với dữ liệu tour này
    navigate("/payment", { state: { items: [itemToPurchase] } });
  };

  return (
    <motion.div
      className="text-gray-800 dark:text-neutral-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Banner */}
      <ParallaxBanner layers={[{ image: tour.image_url || "/images/default.jpg", speed: -20 }]} className="h-[60vh] md:h-[70vh] relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end items-center text-white text-center p-6 md:p-10">
          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {tour.name} {/* Sửa thành tour.name */}
          </motion.h1>
          <p className="text-lg md:text-xl drop-shadow-md">{tour.location}</p>
        </div>
      </ParallaxBanner>

      {/* Gallery Slider */}
      <motion.section
         className="max-w-5xl mx-auto py-10 px-4 -mt-16 md:-mt-24 relative z-10"
         initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }}
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-neutral-800">
          <Slider {...sliderSettings}>
            {galleryImages.map((src, i) => (
              <div key={i}>
                <img
                  src={src}
                  alt={`${tour.name} - ảnh ${i + 1}`}
                  className="h-[300px] md:h-[550px] object-cover w-full"
                  // Thêm onError để hiển thị ảnh mặc định nếu ảnh gốc lỗi
                  onError={(e) => { e.target.onerror = null; e.target.src="/images/default.jpg" }}
                />
              </div>
            ))}
          </Slider>
        </div>
      </motion.section>

      {/* Thông tin chính và nút Đặt */}
      <motion.section
        className="max-w-4xl mx-auto p-6 md:p-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg mt-8"
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      >
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
               <h2 className="text-2xl md:text-3xl font-bold mb-4 text-sky-700 dark:text-sky-400">Thông tin chi tiết</h2>
               <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Thời gian:</strong> {tour.duration || 'N/A'}</p>
               <p className="text-gray-600 dark:text-gray-300 mb-4"><strong>Điểm đến:</strong> {tour.location || 'N/A'}</p>
               <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{tour.description || "Chưa có mô tả chi tiết."}</p>
            </div>
            <div className="text-center md:text-right border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6 border-gray-200 dark:border-neutral-700">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Giá chỉ từ</p>
                <p className="text-3xl md:text-4xl font-bold text-red-600 mb-5">{formatCurrency(tour.price)}</p>
                <motion.button
                  onClick={handleBookNow}
                  className="w-full px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-sky-600 transition-all duration-300 flex items-center justify-center gap-3"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <FaCreditCard />
                  Đặt Tour Ngay
                </motion.button>
            </div>
         </div>
      </motion.section>


      {/* Lịch trình (Giả sử bạn có cột itinerary kiểu text[]) */}
      {tour.itinerary && tour.itinerary.length > 0 && (
         <motion.section
            className="max-w-4xl mx-auto p-6 mt-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
         >
           <h2 className="text-2xl font-bold mb-6 text-center text-sky-700 dark:text-sky-400">Lịch Trình Chi Tiết</h2>
           <div className="space-y-6">
             {tour.itinerary.map((item, i) => (
               <div key={i} className="flex gap-4">
                 <div className="flex flex-col items-center">
                   <div className="bg-sky-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">{i + 1}</div>
                   {i < tour.itinerary.length - 1 && <div className="w-0.5 flex-grow bg-gray-200 dark:bg-neutral-700 mt-2"></div>}
                 </div>
                 <div>
                   {/* Giả sử item là string "Ngày 1: Mô tả..." */}
                   <h4 className="font-semibold text-lg text-gray-800 dark:text-white">{item.split(':')[0]}</h4>
                   <p className="text-gray-600 dark:text-gray-300">{item.split(':').slice(1).join(':').trim()}</p>
                 </div>
               </div>
             ))}
           </div>
         </motion.section>
      )}

      {/* Bản đồ (Giữ nguyên) */}
      <motion.section className="max-w-4xl mx-auto my-10 p-5" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">Vị trí điểm đến</h2>
        <div className="rounded-xl overflow-hidden shadow-lg border dark:border-neutral-700">
          <iframe
            title="map"
            // Cập nhật src để tìm kiếm chính xác hơn
            src={`https://maps.google.com/maps?q=${encodeURIComponent(tour.name + ", " + tour.location)}&output=embed`}
            width="100%"
            height="350"
            loading="lazy"
            className="border-0"
          ></iframe>
        </div>
      </motion.section>

    </motion.div>
  );
};

export default TourDetail;