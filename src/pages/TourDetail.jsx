// src/pages/TourDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// SỬA LỖI 1: Đổi sang file 'tours.js' để đồng bộ dữ liệu với trang Home
import { TOURS } from "../data/tours"; 
import { ParallaxBanner } from "react-scroll-parallax";
import Slider from "react-slick";
import { FaGift, FaPlaneDeparture, FaCreditCard } from "react-icons/fa";
import { MdFamilyRestroom } from "react-icons/md";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useCart } from "../context/CartContext";

const formatCurrency = (number) => {
  if (typeof number !== "number") return "N/A";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Logic tìm tour này vốn đã chính xác
  const tour = TOURS.find((t) => t.id === parseInt(id));

  // State và useEffect vẫn giữ nguyên, chúng đang hoạt động tốt
  const [activeMonthData, setActiveMonthData] = useState(null);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    if (tour && tour.departureMonths && tour.departureMonths.length > 0) {
      setActiveMonthData(tour.departureMonths[0]);
    }
    window.scrollTo(0, 0);
  }, [tour]);

  if (!tour) {
    return (
      <motion.div className="text-center text-xl py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Tour không tồn tại hoặc đã bị xóa.
      </motion.div>
    );
  }
  
  const galleryImages = tour?.galleryImages?.length > 0 ? tour.galleryImages : [tour.image];

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

  const handleBookNow = () => {
    // Tạm thời vô hiệu hóa việc chọn tháng để đơn giản hóa, bạn có thể mở lại sau
    // if (!activeMonthData) {
    //   setNotification("Vui lòng chọn tháng khởi hành.");
    //   setTimeout(() => setNotification(""), 3000);
    //   return;
    // }
    addToCart({ tour, monthData: activeMonthData, adults: 1, children: 0 });
    
    navigate("/checkout"); // Chuyển đến trang checkout hợp lý hơn
  };

  return (
    <motion.div
      className="text-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ParallaxBanner layers={[{ image: tour.image || "/images/default.jpg", speed: -20 }]} className="h-[70vh] relative">
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white text-center p-4">
          <motion.h1 className="text-4xl md:text-5xl font-bold mb-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {tour.title}
          </motion.h1>
          <p className="text-lg md:text-xl">{tour.location}</p>
        </div>
      </ParallaxBanner>

      <motion.section className="max-w-5xl mx-auto py-10 px-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <Slider {...sliderSettings}>
          {galleryImages.map((src, i) => (
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

      {/* Phần Lịch khởi hành tạm ẩn đi vì dữ liệu chưa có, bạn có thể mở lại khi cần */}
      {/* <motion.section className="max-w-6xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-lg mt-5" ... > ... </motion.section> */}

      <motion.section className="max-w-6xl mx-auto p-6 mt-8 bg-white rounded-2xl shadow-lg" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">Lịch Trình Chi Tiết</h2>
        <div className="space-y-6">
          {tour.itinerary?.length > 0 ? (
            tour.itinerary.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">{i + 1}</div>
                  {i < tour.itinerary.length - 1 && <div className="w-0.5 flex-grow bg-gray-200 mt-2"></div>}
                </div>
                <div className="pt-1">
                  {/* Giả sử item là string, nếu là object thì dùng item.day */}
                  <h4 className="font-semibold text-lg text-gray-800">{typeof item === 'string' ? `Ngày ${i + 1}` : item.day}</h4>
                  <p className="text-gray-600">{typeof item === 'string' ? item.split(': ')[1] || item : item.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">Chưa có lịch trình chi tiết.</p>
          )}
        </div>
      </motion.section>

      <motion.section className="max-w-5xl mx-auto my-10 p-5" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
        <h2 className="text-2xl font-semibold mb-4">Vị trí điểm đến</h2>
        <div className="rounded-xl overflow-hidden shadow-lg">
          {/* SỬA LỖI 2: Cập nhật lại link Google Maps cho đúng */}
          <iframe
            title="map"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(tour.location || "")}&output=embed`}
            width="100%"
            height="350"
            loading="lazy"
            className="border-0"
          ></iframe>
        </div>
      </motion.section>

      <div className="flex justify-center mb-16">
        <motion.button
          onClick={handleBookNow}
          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-blue-700 transition-all duration-300 flex items-center gap-3"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <FaCreditCard />
          Đặt Tour Ngay
        </motion.button>
      </div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full shadow-lg text-sm z-50"
        >
          {notification}
        </motion.div>
      )}
    </motion.div>
  );
};

export default TourDetail;