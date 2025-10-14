import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TOURS } from "../data/tours";
import { ParallaxBanner } from "react-scroll-parallax";
import Slider from "react-slick";
import { FaMapMarkerAlt, FaClock, FaUsers, FaUtensils, FaGift, FaBusAlt } from "react-icons/fa";
import { MdEventAvailable } from "react-icons/md";
import ReactStars from "react-rating-stars-component";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = React.useState("10/2025");

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
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white text-center">
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
        className="max-w-5xl mx-auto py-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Slider {...sliderSettings}>
          {[tour.image, "/images/travel1.jpg", "/images/travel2.jpg"].map((src, i) => (
            <div key={i}>
              <img
                src={src}
                alt={tour.title}
                className="rounded-xl mx-auto shadow-lg h-[500px] object-cover w-full"
              />
            </div>
          ))}
        </Slider>
      </motion.section>

      {/* ---------- LỊCH KHỞI HÀNH ---------- */}
      <motion.section
        className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">LỊCH KHỞI HÀNH</h2>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Cột chọn tháng */}
          <div className="flex md:flex-col gap-3 md:w-[180px]">
            {["10/2025", "11/2025", "12/2025", "1/2026", "2/2026"].map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border hover:bg-blue-50 transition ${
                  month === selectedMonth ? "bg-blue-600 text-white" : "text-gray-700"
                }`}
              >
                {month}
              </button>
            ))}
          </div>

          {/* Bảng thông tin chuyến đi */}
          <div className="flex-1 bg-gray-50 p-5 rounded-xl shadow-inner">
            <div className="flex justify-between mb-3">
              <span className="font-semibold">Ngày đi: {tour.monthlyInfo[selectedMonth].dates.start}</span>
              <span className="font-semibold text-red-600">Hạn đặt: {tour.monthlyInfo[selectedMonth].dates.book}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
              <div>
                <p className="font-semibold text-gray-700">Người lớn</p>
                <p className="text-red-600 font-bold text-lg">{tour.monthlyInfo[selectedMonth].prices.adult}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Trẻ em</p>
                <p className="text-red-600 font-bold text-lg">{tour.monthlyInfo[selectedMonth].prices.child}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Trẻ nhỏ</p>
                <p className="text-gray-400 font-bold text-lg">{tour.monthlyInfo[selectedMonth].prices.infant}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Phụ thu phòng đơn</p>
                <p className="text-red-600 font-bold text-lg">{tour.monthlyInfo[selectedMonth].prices.singleRoom}</p>
              </div>
            </div>

            {/* Thông tin thêm về tour */}
            <div className="mt-4 p-4 bg-white rounded-lg">
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Đối tượng phù hợp:</span> {tour.monthlyInfo[selectedMonth].group}
              </p>
              <p className="text-green-600 font-semibold mb-2">
                {tour.monthlyInfo[selectedMonth].promotion}
              </p>
              <div className="mt-3">
                <p className="font-semibold mb-2">Các chuyến bay:</p>
                <div className="grid gap-2">
                  {tour.monthlyInfo[selectedMonth].flights.map((flight, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-1">
                      <span>{flight.airline}</span>
                      <span className="text-blue-600">{flight.time}</span>
                      <span className="font-medium">{flight.price}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  *Chuyến bay rẻ nhất: {tour.monthlyInfo[selectedMonth].flights.reduce((min, flight) => 
                    parseFloat(flight.price.replace(/[^\d]/g, '')) < parseFloat(min.price.replace(/[^\d]/g, '')) ? flight : min
                  ).airline} - {tour.monthlyInfo[selectedMonth].flights.reduce((min, flight) => 
                    parseFloat(flight.price.replace(/[^\d]/g, '')) < parseFloat(min.price.replace(/[^\d]/g, '')) ? flight : min
                  ).price}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3 italic">
              *Tự túc ăn chiều ngày thứ 3 và vé Vinwonder. Liên hệ tổng đài: 1800 646 888 (08:00–22:00)
            </p>
          </div>
        </div>
      </motion.section>

      {/* ---------- THÔNG TIN CHUYẾN ĐI ---------- */}
      <motion.section
        className="max-w-6xl mx-auto p-6 mt-8 bg-white rounded-2xl shadow-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          THÔNG TIN THÊM VỀ CHUYẾN ĐI
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-gray-700">
          <div className="flex flex-col items-center text-center">
            <FaMapMarkerAlt className="text-blue-500 text-3xl mb-2" />
            <h3 className="font-semibold">Điểm tham quan</h3>
            <p>Nha Trang, Vinwonder, Biển Nhũ Tiên, Mũi Né...</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FaUtensils className="text-blue-500 text-3xl mb-2" />
            <h3 className="font-semibold">Ẩm thực</h3>
            <p>Thực đơn đa dạng, đặc sản vùng miền</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FaUsers className="text-blue-500 text-3xl mb-2" />
            <h3 className="font-semibold">Đối tượng phù hợp</h3>
            <p>Gia đình, cặp đôi, nhóm bạn, trẻ em</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FaBusAlt className="text-blue-500 text-3xl mb-2" />
            <h3 className="font-semibold">Phương tiện</h3>
            <p>Xe du lịch, máy bay tùy gói</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <MdEventAvailable className="text-blue-500 text-3xl mb-2" />
            <h3 className="font-semibold">Thời gian lý tưởng</h3>
            <p>Quanh năm</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FaGift className="text-blue-500 text-3xl mb-2" />
            <h3 className="font-semibold">Khuyến mãi</h3>
            <p>Đã bao gồm ưu đãi tour</p>
          </div>
        </div>
      </motion.section>

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
