import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TOURS } from "../data/tours_updated.js";
import { useCart } from "../context/CartContext.jsx"; // Import hook quản lý giỏ hàng
import { ParallaxBanner } from "react-scroll-parallax";
import Slider from "react-slick";
import {
  FaMapMarkerAlt,
  FaUtensils,
  FaGift,
  FaBusAlt,
  FaUsers,
  FaPlaneDeparture,
  FaPlus,
  FaMinus,
  FaCreditCard // Icon mới cho nút đặt tour
} from "react-icons/fa";
import { MdFamilyRestroom } from "react-icons/md";
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
  // ✅ Lấy thêm hàm clearCart từ context
  const { addToCart, clearCart } = useCart();
  const tour = TOURS.find((t) => t.id === parseInt(id));

  const [activeMonthData, setActiveMonthData] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (tour && tour.departureMonths && tour.departureMonths.length > 0) {
      setActiveMonthData(tour.departureMonths[0]);
    }
  }, [tour]);

  // ✅ HÀM MỚI: Xử lý "Đặt Tour Ngay" để chuyển sang trang thanh toán
  const handleBookNow = () => {
    // Kiểm tra các điều kiện
    if (!activeMonthData) {
        setNotification('Vui lòng chọn tháng khởi hành.');
        setTimeout(() => setNotification(''), 3000);
        return;
    }
    if (adults === 0 && children === 0) {
       setNotification('Vui lòng chọn ít nhất 1 người lớn hoặc trẻ em.');
       setTimeout(() => setNotification(''), 3000);
      return;
    }

    // Tạo đối tượng tour để thêm vào giỏ
    const itemToBook = {
      tour: tour,
      selectedMonth: activeMonthData,
      adults: adults,
      children: children,
    };
    
    clearCart(); // Xóa các tour khác trong giỏ hàng (hành vi "mua ngay")
    addToCart(itemToBook); // Thêm tour hiện tại vào giỏ
    navigate('/checkout'); // Chuyển thẳng đến trang thanh toán
  };
  
  if (!tour) {
    return <motion.div className="text-center text-xl py-20">Tour không tồn tại.</motion.div>;
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
      {/* --- Các phần Parallax, Slider giữ nguyên --- */}
      <ParallaxBanner
        layers={[{ image: tour.image, speed: -20 }]}
        className="h-[70vh] relative"
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white text-center p-4">
            <motion.h1 className="text-4xl md:text-5xl font-bold mb-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{tour.title}</motion.h1>
            <p className="text-lg md:text-xl">{tour.location}</p>
        </div>
      </ParallaxBanner>

      <motion.section className="max-w-5xl mx-auto py-10 px-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <Slider {...sliderSettings}>
          {[tour.image, "/images/travel1.jpg", "/images/travel2.jpg"].map((src, i) => (
            <div key={i}><img src={src} alt={`${tour.title} - ảnh ${i + 1}`} className="rounded-xl mx-auto shadow-lg h-[300px] md:h-[500px] object-cover w-full" /></div>
          ))}
        </Slider>
      </motion.section>

      {/* --- LỊCH KHỞI HÀNH & CHỌN SỐ LƯỢNG --- */}
      <motion.section
        className="max-w-6xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-lg mt-5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">LỊCH KHỞI HÀNH & GIÁ TOUR</h2>

        {tour.departureMonths && tour.departureMonths.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cột chọn tháng */}
            <div className="flex overflow-x-auto md:flex-col gap-3 md:w-[200px] pb-2 md:pb-0">
              {tour.departureMonths.map((monthData) => (
                <button
                  key={monthData.month}
                  onClick={() => setActiveMonthData(monthData)}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold border-2 w-full text-left transition ${ activeMonthData?.month === monthData.month ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 hover:bg-blue-50" }`}
                >
                  Tháng {monthData.month}
                </button>
              ))}
            </div>

            {/* Bảng thông tin và chọn số lượng */}
            {activeMonthData && (
              <div className="flex-1 space-y-6">
                <div className="bg-gray-50 p-5 rounded-xl shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Ngày khởi hành:</h3>
                        <div className="text-right font-semibold text-blue-600">{activeMonthData.departureDates.join(' | ')}</div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div><p className="font-semibold">Người lớn</p><p className="text-red-600 font-bold">{formatCurrency(activeMonthData.prices.adult)}</p></div>
                        <div><p className="font-semibold">Trẻ em</p><p className="text-red-600 font-bold">{formatCurrency(activeMonthData.prices.child)}</p></div>
                        <div><p className="font-semibold">Trẻ nhỏ</p><p className="text-gray-500 font-bold">{formatCurrency(activeMonthData.prices.infant)}</p></div>
                        <div><p className="font-semibold">Phụ thu phòng đơn</p><p className="text-red-600 font-bold">{formatCurrency(activeMonthData.prices.singleSupplement)}</p></div>
                    </div>
                </div>

                <div className="bg-blue-50 p-5 rounded-xl">
                  <h3 className="font-bold text-lg mb-4 text-blue-800">Chọn số lượng khách</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold">Người lớn:</label>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setAdults(Math.max(1, adults - 1))} className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition"><FaMinus /></button>
                        <span className="font-bold text-lg w-8 text-center">{adults}</span>
                        <button onClick={() => setAdults(adults + 1)} className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition"><FaPlus /></button>
                      </div>
                    </div>
                     <div className="flex items-center justify-between">
                      <label className="font-semibold">Trẻ em (2-11 tuổi):</label>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setChildren(Math.max(0, children - 1))} className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition"><FaMinus /></button>
                        <span className="font-bold text-lg w-8 text-center">{children}</span>
                        <button onClick={() => setChildren(children + 1)} className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition"><FaPlus /></button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">Chưa có lịch khởi hành.</p>
        )}
      </motion.section>
      
      {/* --- ✅ NÚT ĐẶT TOUR đã được cập nhật --- */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm py-4 shadow-top z-10">
          <div className="max-w-6xl mx-auto flex justify-center items-center px-4">
              <motion.button
                onClick={handleBookNow}
                className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
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
      </div>

      {/* --- Các phần Lịch trình, Map giữ nguyên --- */}
       <motion.section className="max-w-6xl mx-auto p-6 mt-8 bg-white rounded-2xl shadow-lg" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold mb-6 text-center">LỊCH TRÌNH</h2>
        {tour.itinerary.map((item, i) => (
            <div key={i} className="mb-4">
                <p className="font-semibold text-blue-600">Ngày {i + 1}</p>
                <p className="text-gray-700">{item}</p>
            </div>
        ))}
      </motion.section>

      <motion.section className="max-w-5xl mx-auto my-10 p-5" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <h2 className="text-2xl font-semibold mb-4">Vị trí điểm đến</h2>
          <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe title="map" src={`https://www.google.com/maps?q=${encodeURIComponent(tour.location)}&output=embed`} width="100%" height="350" loading="lazy"></iframe>
          </div>
      </motion.section>

    </motion.div>
  );
};

export default TourDetail;

