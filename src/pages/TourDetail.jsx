import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TOURS } from "../data/tours";
import { ParallaxBanner } from "react-scroll-parallax";
import Slider from "react-slick";
import { FaMapMarkerAlt, FaPlane, FaClock, FaUsers } from "react-icons/fa";
import { MdOutlineAirplanemodeActive } from "react-icons/md";
import ReactStars from "react-rating-stars-component";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const tour = TOURS.find((t) => t.id === parseInt(id));

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
      initial={{ opacity: 0, y: 30 }}          // Bắt đầu mờ và trượt nhẹ lên
      animate={{ opacity: 1, y: 0 }}           // Hiện dần lên mượt
      exit={{ opacity: 0, y: -30 }}            // Khi rời trang thì trượt nhẹ lên và mờ đi
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Hero parallax */}
      <ParallaxBanner
        layers={[{ image: tour.image, speed: -20 }]}
        className="h-[70vh] relative"
      >
        <motion.div
          className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {tour.title}
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {tour.location}
          </motion.p>
        </motion.div>
      </ParallaxBanner>

      {/* Slideshow */}
      <motion.section
        className="max-w-5xl mx-auto py-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Slider {...sliderSettings}>
          <div>
            <img src={tour.image} alt={tour.title} className="rounded-xl mx-auto shadow-lg" />
          </div>
          <div>
            <img src="/images/travel1.jpg" alt="Travel 1" className="rounded-xl mx-auto shadow-lg" />
          </div>
          <div>
            <img src="/images/travel2.jpg" alt="Travel 2" className="rounded-xl mx-auto shadow-lg" />
          </div>
        </Slider>
      </motion.section>

      {/* Thông tin chính */}
      <motion.section
        className="max-w-5xl mx-auto p-5 grid md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Cột trái */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            className="bg-white p-6 rounded-2xl shadow"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Giới thiệu</h2>
            <p className="leading-relaxed text-gray-700">{tour.description}</p>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-2xl shadow"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Hành trình</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {tour.itinerary.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-2xl shadow"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Đánh giá</h2>
            <ReactStars
              count={5}
              value={4.5}
              size={30}
              edit={false}
              isHalf={true}
              activeColor="#ffd700"
            />
            <p className="mt-3 text-gray-600">
              Tour được đánh giá cao bởi <strong>98%</strong> khách hàng!
            </p>
          </motion.div>
        </div>

        {/* Cột phải */}
        <motion.div
          className="bg-white p-6 rounded-2xl shadow space-y-4"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-xl font-bold mb-3">Thông tin tour</h2>

          <p className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" /> {tour.location}
          </p>
          <p className="flex items-center gap-2">
            <FaClock className="text-blue-500" /> {tour.duration}
          </p>
          <p className="flex items-center gap-2">
            <FaUsers className="text-blue-500" /> {tour.people} khách
          </p>

          <div className="pt-2 border-t">
            <p className="font-semibold text-lg">
              Giá:{" "}
              <span className="text-red-500 text-2xl font-bold">
                {tour.price.toLocaleString("vi-VN")}đ
              </span>
            </p>
            <p className="text-gray-500 text-sm">
              (Giảm {tour.discount}% cho khách đặt online)
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MdOutlineAirplanemodeActive /> Chuyến bay
            </h3>
            <p>✈ {tour.flight.airline}</p>
            <p>Đi: {tour.flight.departDate} – {tour.flight.departTime}</p>
            <p>Về: {tour.flight.returnDate} – {tour.flight.returnTime}</p>
          </div>

          <motion.button
            onClick={() => navigate(`/booking/${tour.id}`)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
          >
            Đặt Tour Ngay
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Google Map */}
      <motion.section
        className="max-w-5xl mx-auto my-10 p-5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Vị trí điểm đến</h2>
        <motion.div
          className="rounded-xl overflow-hidden shadow-lg"
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <iframe
            title="map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              tour.location
            )}&output=embed`}
            width="100%"
            height="350"
            loading="lazy"
          ></iframe>
        </motion.div>
      </motion.section>
    </motion.div>
  );
};

export default TourDetail;
