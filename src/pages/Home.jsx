import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TOURS } from "../data/tours";
import { promotionsData } from "../data/promotionsData.js";
import FlyingPlane from "../components/FlyingPlane";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();
  const [selectedPromo, setSelectedPromo] = useState(null);

  // 🌍 Blog mẫu (có thể chuyển qua lấy từ API sau)
  const blogs = [
    {
      id: 1,
      title: "Top 5 bãi biển đẹp nhất Việt Nam bạn nên đến ít nhất một lần",
      excerpt:
        "Cùng khám phá 5 bãi biển tuyệt đẹp trải dài từ Bắc chí Nam – từ Hạ Long thơ mộng đến Phú Quốc rực rỡ nắng vàng...",
      image: "/images/blog_beach.jpg",
    },
    {
      id: 2,
      title: "Kinh nghiệm du lịch Đà Lạt 3 ngày 2 đêm siêu tiết kiệm",
      excerpt:
        "Thành phố ngàn hoa luôn là điểm đến mơ ước của giới trẻ. Dưới đây là hành trình 3N2Đ lý tưởng cho bạn cùng nhóm bạn thân...",
      image: "/images/blog_dalat.jpg",
    },
    {
      id: 3,
      title: "Những món ăn đường phố không thể bỏ qua khi đến Nha Trang",
      excerpt:
        "Ẩm thực Nha Trang không chỉ có hải sản tươi ngon mà còn là thiên đường của các món ăn vặt hấp dẫn khó cưỡng...",
      image: "/images/blog_nhatrang.jpg",
    },
  ];

  return (
    <div className="relative bg-gradient-to-b from-blue-50 via-sky-100 to-white overflow-hidden">
      {/* ✈️ Hiệu ứng bay */}
      <FlyingPlane />

      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center py-16 px-6"
      >
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          Khám phá thế giới cùng VietTravel
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Những hành trình tuyệt vời đang chờ bạn — chọn tour, đặt ngay, và bắt đầu chuyến phiêu lưu đáng nhớ!
        </p>
      </motion.section>

      {/* TOUR NỔI BẬT */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 mb-16"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          🌍 Tour Nổi Bật
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TOURS.slice(0, 3).map((tour) => (
            <motion.div
              key={tour.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden cursor-pointer"
              onClick={() => navigate(`/tour/${tour.id}`)}
            >
              <img src={tour.image} alt={tour.title} className="h-48 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">{tour.title}</h3>
                <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                  <FaMapMarkerAlt className="text-blue-500" /> {tour.location}
                </p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-red-600 font-semibold">
                    {tour.price.toLocaleString("vi-VN")}₫
                  </span>
                  <button className="text-blue-600 font-medium hover:underline">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* TOUR BÁN CHẠY */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 mb-16"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">🔥 Tour Bán Chạy</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {TOURS.slice(3, 7).map((tour) => (
            <motion.div
              key={tour.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden cursor-pointer"
              onClick={() => navigate(`/tour/${tour.id}`)}
            >
              <img src={tour.image} alt={tour.title} className="h-40 w-full object-cover" />
              <div className="p-3">
                <h3 className="font-medium text-gray-800 text-sm">{tour.title}</h3>
                <div className="flex items-center justify-between mt-2 text-gray-600 text-xs">
                  <span>{tour.location}</span>
                  <div className="flex gap-1 text-yellow-500">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                </div>
                <div className="text-red-600 font-semibold mt-2 text-sm">
                  {tour.price.toLocaleString("vi-VN")}₫
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ĐIỂM ĐẾN YÊU THÍCH */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 mb-20"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">🏖️ Điểm Đến Yêu Thích</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { name: "Phú Quốc", img: "/images/destination_phuquoc.jpg" },
            { name: "Đà Lạt", img: "/images/destination_dalat.jpg" },
            { name: "Nha Trang", img: "/images/destination_nhatrang.jpg" },
            { name: "Hạ Long", img: "/images/destination_halong.jpg" },
          ].map((dest, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer"
            >
              <img src={dest.img} alt={dest.name} className="h-48 w-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-4">
                <span className="text-white text-lg font-semibold">{dest.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ƯU ĐÃI ĐẶC BIỆT */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="bg-gradient-to-r from-blue-100 to-blue-200 py-16"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
            🎁 Ưu Đãi Đặc Biệt
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {promotionsData.map((promo) => (
              <motion.div
                key={promo.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:shadow-xl"
                onClick={() => setSelectedPromo(promo)}
              >
                <h3 className="text-lg font-semibold text-blue-700 mb-2">
                  {promo.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{promo.description}</p>
                <p className="text-red-600 font-bold">{promo.discount}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Modal chi tiết ưu đãi */}
        {selectedPromo && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl p-8 max-w-md"
            >
              <h3 className="text-xl font-semibold text-blue-700 mb-3">
                {selectedPromo.title}
              </h3>
              <p className="text-gray-600 mb-4">{selectedPromo.description}</p>
              <p className="text-red-600 font-bold text-lg mb-6">
                Giảm: {selectedPromo.discount}
              </p>
              <button
                onClick={() => setSelectedPromo(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Đóng
              </button>
            </motion.div>
          </div>
        )}
      </motion.section>

      {/* 📰 BLOG DU LỊCH */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 py-20"
      >
        <h2 className="text-2xl font-semibold mb-10 text-gray-800 text-center">
          📰 Blog Du Lịch
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {blogs.map((post) => (
            <motion.div
              key={post.id}
              whileHover={{ scale: 1.03 }}
              className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition cursor-pointer"
            >
              <img src={post.image} alt={post.title} className="h-56 w-full object-cover" />
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 text-lg mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <button className="text-blue-600 font-medium hover:underline">
                  Đọc thêm →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
