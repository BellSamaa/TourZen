// src/pages/TourDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TOURS } from "../data/tours_updated"; // Đảm bảo đường dẫn này đúng
import { ParallaxBanner } from "react-scroll-parallax";
import Slider from "react-slick";
import { FaCreditCard } from "react-icons/fa";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useCart } from "../context/CartContext";

// Helper định dạng tiền tệ
const formatCurrency = (number) => {
  if (typeof number !== "number") return "N/A";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const tour = TOURS.find((t) => t.id === parseInt(id));

  const [activeMonthData, setActiveMonthData] = useState(null);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    // Tự động chọn tháng đầu tiên khi component tải
    if (tour?.departureMonths?.length > 0) {
      setActiveMonthData(tour.departureMonths[0]);
    }
    // Cuộn lên đầu trang mỗi khi xem tour mới
    window.scrollTo(0, 0);
  }, [tour]);

  // ✅ CẢI TIẾN 1: Slider ảnh thông minh hơn
  // Lấy ảnh từ gallery trong data, nếu không có thì fallback về ảnh chính
  const galleryImages = tour?.galleryImages?.length > 0 ? tour.galleryImages : [tour?.image || "/images/default.jpg"];

  if (!tour) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div className="text-center text-xl py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Tour không tồn tại hoặc đã bị xóa.
        </motion.div>
      </div>
    );
  }

  const sliderSettings = {
    dots: true,
    infinite: galleryImages.length > 1, // Chỉ lặp lại nếu có nhiều hơn 1 ảnh
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
    arrows: false,
  };

  const handleBookNow = () => {
    if (!activeMonthData) {
      setNotification("Vui lòng chọn tháng khởi hành.");
      setTimeout(() => setNotification(""), 3000);
      return;
    }
    addToCart({ tour, monthData: activeMonthData, adults: 1, children: 0, infants: 0 });
    navigate("/payment");
  };

  return (
    <motion.div
      className="bg-gray-50 text-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* HERO SECTION */}
      <ParallaxBanner
        layers={[{ image: tour.image || "/images/default.jpg", speed: -20 }]}
        className="h-[60vh] md:h-[70vh]"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end items-start text-white p-6 md:p-12">
          <motion.h1
            className="text-4xl md:text-6xl font-bold drop-shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {tour.title}
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl mt-2 drop-shadow-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {tour.location}
          </motion.p>
        </div>
      </ParallaxBanner>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* CỘT NỘI DUNG CHÍNH */}
          <div className="lg:w-2/3">
            {/* SLIDER ẢNH */}
            <motion.section
              className="mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Slider {...sliderSettings}>
                {galleryImages.map((src, i) => (
                  <div key={i}>
                    <img
                      src={src}
                      alt={`${tour.title} - ảnh gallery ${i + 1}`}
                      className="rounded-xl object-cover w-full h-[300px] md:h-[500px]"
                    />
                  </div>
                ))}
              </Slider>
            </motion.section>

            {/* LỊCH TRÌNH */}
            <motion.section
              className="bg-white p-6 rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">Lịch Trình Chi Tiết</h2>
              <div className="space-y-6">
                {tour.itinerary?.length > 0 ? (
                  tour.itinerary.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">{i + 1}</div>
                        {i < tour.itinerary.length - 1 && <div className="w-0.5 flex-grow bg-gray-200 mt-2"></div>}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-gray-800">{item.day || `Ngày ${i + 1}`}</h4>
                        <p className="text-gray-600">{item.description || item}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">Chưa có lịch trình chi tiết.</p>
                )}
              </div>
            </motion.section>

            {/* MAP */}
            <motion.section
              className="my-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold mb-4">Vị Trí Trên Bản Đồ</h2>
              <div className="rounded-xl overflow-hidden shadow-lg border">
                 {/* ✅ CẢI TIẾN 2: Sửa lại URL Google Maps cho đúng chuẩn */}
                <iframe
                  title="map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(tour.location || "")}&output=embed`}
                  width="100%"
                  height="400"
                  loading="lazy"
                  className="border-0"
                ></iframe>
              </div>
            </motion.section>
          </div>

          {/* ✅ CẢI TIẾN 3: WIDGET ĐẶT TOUR (STICKY) */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold mb-5 text-center text-blue-800">Thông Tin Đặt Tour</h2>
                {tour.departureMonths?.length > 0 ? (
                  <>
                    <h3 className="font-semibold mb-2">Chọn tháng khởi hành:</h3>
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {tour.departureMonths.map((monthData) => (
                        <button
                          key={monthData.month}
                          onClick={() => setActiveMonthData(monthData)}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold border-2 transition ${
                            activeMonthData?.month === monthData.month
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          Tháng {monthData.month}
                        </button>
                      ))}
                    </div>

                    {activeMonthData && (
                      <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Giá người lớn:</span>
                          <span className="font-bold text-red-600 text-xl">{formatCurrency(activeMonthData.prices?.adult)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Ngày khởi hành:</span>
                          <span className="font-semibold text-blue-700">{activeMonthData.departureDates?.join(", ")}</span>
                        </div>
                        {activeMonthData.promotions && (
                           <div className="text-xs text-orange-600 text-center pt-2 border-t">
                             {activeMonthData.promotions}
                           </div>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={handleBookNow}
                      className="w-full mt-5 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <FaCreditCard className="inline mr-2" />
                      Đặt Tour Ngay
                    </button>
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-10">Hiện chưa có lịch khởi hành.</p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full shadow-lg text-sm z-50"
        >
          {notification}
        </motion.div>
      )}
    </motion.div>
  );
};

export default TourDetail;