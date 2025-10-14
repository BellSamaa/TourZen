import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// ✅ BƯỚC 1: Đổi file import để lấy dữ liệu mới
import { TOURS } from "../data/tours_updated";
import { ParallaxBanner } from "react-scroll-parallax";
import Slider from "react-slick";
import {
  FaMapMarkerAlt,
  FaUtensils,
  FaGift,
  FaBusAlt,
  FaUsers,
  FaPlaneDeparture,
  FaBaby,
  FaCheckCircle,
  FaInfoCircle
} from "react-icons/fa";
import { MdEventAvailable, MdFamilyRestroom } from "react-icons/md";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Hàm helper để định dạng tiền tệ
const formatCurrency = (number) => {
  if (typeof number !== 'number') return "N/A";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
};


const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const tour = TOURS.find((t) => t.id === parseInt(id));

  // ✅ BƯỚC 2: Thêm State để quản lý tháng đang được chọn
  const [activeMonthData, setActiveMonthData] = useState(null);

  // Tự động chọn tháng đầu tiên khi load trang
  useEffect(() => {
    if (tour && tour.departureMonths && tour.departureMonths.length > 0) {
      setActiveMonthData(tour.departureMonths[0]);
    }
  }, [tour]);


  if (!tour) {
    return (
      <motion.div
        className="text-center text-xl py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Tour không tồn tại.
      </motion.div>
    );
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
  };

  return (
    <motion.div
      className="text-gray-800"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* ---------- HERO PARALLAX ---------- */}
      <ParallaxBanner
        layers={[{ image: tour.image, speed: -20 }]}
        className="h-[70vh] relative"
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white text-center p-4">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {tour.title}
          </motion.h1>
          <p className="text-lg md:text-xl">{tour.location}</p>
        </div>
      </ParallaxBanner>

      {/* ---------- SLIDER ẢNH ---------- */}
      <motion.section
        className="max-w-5xl mx-auto py-10 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Slider {...sliderSettings}>
          {[tour.image, "/images/travel1.jpg", "/images/travel2.jpg"].map((src, i) => (
            <div key={i}>
              <img
                src={src}
                alt={`${tour.title} - ảnh ${i + 1}`}
                className="rounded-xl mx-auto shadow-lg h-[300px] md:h-[500px] object-cover w-full"
              />
            </div>
          ))}
        </Slider>
      </motion.section>

      {/* ================================================================== */}
      {/* ---------- ✅ BƯỚC 3: THAY THẾ TOÀN BỘ PHẦN LỊCH KHỞI HÀNH ---------- */}
      {/* ================================================================== */}
      <motion.section
        className="max-w-6xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-lg mt-5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">LỊCH KHỞI HÀNH</h2>

        {tour.departureMonths && tour.departureMonths.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cột chọn tháng (Tự động hiển thị các tháng có trong dữ liệu) */}
            <div className="flex overflow-x-auto md:overflow-x-visible md:flex-col gap-3 md:w-[200px] pb-2 md:pb-0">
              {tour.departureMonths.map((monthData) => (
                <button
                  key={monthData.month}
                  onClick={() => setActiveMonthData(monthData)}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold border-2 w-full text-left transition duration-300 ease-in-out transform hover:-translate-y-1 ${
                    activeMonthData?.month === monthData.month
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                  }`}
                >
                  Tháng {monthData.month}
                </button>
              ))}
            </div>

            {/* Bảng thông tin chuyến đi (Hiển thị động theo tháng đã chọn) */}
            {activeMonthData && (
              <div className="flex-1 bg-gray-50 p-5 rounded-xl shadow-inner">
                {/* Ngày đi và Giá */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-gray-800">Ngày khởi hành:</h3>
                     <div className="text-right font-semibold text-blue-600">
                        {activeMonthData.departureDates.join(' | ')}
                     </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <p className="font-semibold text-gray-700">Người lớn</p>
                      <p className="text-red-600 font-bold text-lg">{formatCurrency(activeMonthData.prices.adult)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Trẻ em</p>
                      <p className="text-red-600 font-bold text-lg">{formatCurrency(activeMonthData.prices.child)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Trẻ nhỏ</p>
                      <p className="text-gray-500 font-bold text-lg">{formatCurrency(activeMonthData.prices.infant)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Phụ thu phòng đơn</p>
                      <p className="text-red-600 font-bold text-lg">{formatCurrency(activeMonthData.prices.singleSupplement)}</p>
                    </div>
                  </div>
                </div>

                {/* Thông tin thêm */}
                <div className="space-y-3 text-sm">
                    <div className="flex items-start">
                        <FaGift className="text-orange-500 text-base mr-3 mt-1 flex-shrink-0" />
                        <p><span className="font-semibold">Ưu đãi tháng:</span> {activeMonthData.promotions}</p>
                    </div>
                     <div className="flex items-start">
                        <MdFamilyRestroom className="text-green-500 text-base mr-3 mt-1 flex-shrink-0" />
                        <p><span className="font-semibold">Phù hợp cho:</span> {activeMonthData.familySuitability}</p>
                    </div>
                     <div className="flex items-start">
                        <FaPlaneDeparture className="text-sky-500 text-base mr-3 mt-1 flex-shrink-0" />
                        <p><span className="font-semibold">Thông tin chuyến bay:</span> {activeMonthData.flightDeals}</p>
                    </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-4 pt-4 border-t italic">
                  {activeMonthData.notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">Chưa có lịch khởi hành cho tour này. Vui lòng quay lại sau.</p>
        )}
      </motion.section>

      {/* Các phần còn lại của trang giữ nguyên */}
      {/* ---------- LỊCH TRÌNH ---------- */}
      <motion.section
        className="max-w-6xl mx-auto p-6 mt-8 bg-white rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">LỊCH TRÌNH</h2>
        {tour.itinerary.map((item, i) => (
          <div key={i} className="mb-4">
            <p className="font-semibold text-blue-600">Ngày {i + 1}</p>
            <p className="text-gray-700">{item}</p>
          </div>
        ))}
      </motion.section>

      {/* ---------- MAP ---------- */}
      <motion.section
        className="max-w-5xl mx-auto my-10 p-5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Vị trí điểm đến</h2>
        <div className="rounded-xl overflow-hidden shadow-lg">
          <iframe
            title="map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              tour.location
            )}&output=embed`}
            width="100%"
            height="350"
            loading="lazy"
          ></iframe>
        </div>
      </motion.section>

      {/* ---------- NÚT ĐẶT TOUR ---------- */}
      <div className="flex justify-center mb-16">
        <motion.button
          onClick={() => navigate(`/booking/${tour.id}`)}
          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-blue-700 transition-all duration-300"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          Đặt Tour Ngay
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TourDetail;
