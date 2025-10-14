// src/pages/Home.jsx
import React from "react";
import { motion } from "framer-motion";
import HeroSlider from "../components/HeroSlider";
import TourCard from "../components/TourCard";
import { TOURS, DESTINATIONS } from "../data/tours";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

export default function Home() {
  const featured = TOURS.slice(0, 6);
  const cheap = [...TOURS].sort((a, b) => a.price - b.price).slice(0, 6);
  const popular = [...TOURS].sort((a, b) => b.sold - a.sold).slice(0, 6);

  return (
    <motion.div initial="hidden" animate="visible" className="bg-gray-900 text-gray-100 relative overflow-hidden">

      {/* 🌿 HIỆU ỨNG HOA LÁ BAY NGHIÊNG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`leaf-${i}`}
            className="absolute w-4 h-4 bg-green-400 rounded-full opacity-70 blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `leafDrift ${5 + Math.random() * 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`petal-${i}`}
            className="absolute w-3 h-3 bg-yellow-300 rounded-full opacity-80 blur-xs"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `petalDrift ${6 + Math.random() * 6}s linear infinite`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      {/* HERO */}
      <section className="relative w-full h-[85vh] overflow-hidden">
        <HeroSlider />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/10 animate-pulse-slow"></div>
      </section>

      {/* TOUR NỔI BẬT */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative z-10">
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-center mb-12 text-yellow-400 glow-text">
          🌟 Tour nổi bật
        </motion.h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {featured.map((t, i) => (
            <motion.div
              key={t.id}
              variants={fadeUp}
              custom={i}
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255,255,255,0.15)" }}
              className="transition-transform duration-300 relative tour-card-float"
            >
              <TourCard tour={t} />
              <div className="absolute inset-0 pointer-events-none shimmer-overlay"></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ƯU ĐÃI ĐẶC BIỆT */}
      <section className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 py-20 relative z-10">
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-300 glow-text">
          🔥 Ưu đãi đặc biệt
        </motion.h2>
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 px-6">
          {cheap.map((t, i) => (
            <motion.div
              key={t.id}
              variants={fadeUp}
              custom={i}
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255,255,255,0.12)" }}
              className="transition-transform duration-300 relative tour-card-float"
            >
              <TourCard tour={t} />
              <div className="absolute inset-0 pointer-events-none shimmer-overlay"></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TOUR BÁN CHẠY */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 relative z-10">
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-center mb-12 text-purple-300 glow-text">
          💯 Tour bán chạy
        </motion.h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {popular.map((t, i) => (
            <motion.div
              key={t.id}
              variants={fadeUp}
              custom={i}
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255,255,255,0.15)" }}
              className="transition-transform duration-300 relative tour-card-float"
            >
              <TourCard tour={t} />
              <div className="absolute inset-0 pointer-events-none shimmer-overlay"></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ĐIỂM ĐẾN THU HÚT */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-gradient-to-r from-yellow-900 via-yellow-800 to-yellow-900 relative z-10">
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-center mb-12 text-yellow-200 glow-text">
          ✨ Điểm đến thu hút
        </motion.h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {DESTINATIONS.map((d, i) => (
            <motion.div
              key={d.id}
              variants={fadeUp}
              custom={i}
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(255,255,255,0.2)" }}
              className="relative overflow-hidden rounded-xl"
            >
              <img src={d.image} alt={d.name} className="w-full h-56 object-cover rounded-xl" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3 text-center font-semibold">
                {d.name}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA CUỐI TRANG */}
      <section
        className="relative bg-cover bg-center py-20 text-white"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1470&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/40 animate-pulse-slow"></div>
        <div className="relative z-10 px-4 text-center">
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4 glow-text">
            Sẵn sàng cho hành trình tiếp theo?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="mb-8 text-lg max-w-2xl mx-auto">
            Hàng ngàn tour du lịch đang chờ bạn khám phá cùng{" "}
            <span className="font-semibold text-white">TourZen</span> ✈️
          </motion.p>
          <motion.a
            href="/tours"
            variants={fadeUp}
            custom={2}
            className="inline-block bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all shadow-lg"
          >
            Xem tất cả tour
          </motion.a>
        </div>
      </section>

      <style>{`
        .glow-text { text-shadow: 0 0 6px rgba(255,255,255,0.4); }
        @keyframes pulse-slow { 0%,100% { opacity: 0.85; } 50% { opacity: 1; } }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }

        /* Float nhẹ cho card */
        @keyframes floatCard { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .tour-card-float { animation: floatCard 6s ease-in-out infinite; }

        /* Shimmer overlay */
        .shimmer-overlay {
          background: linear-gradient(120deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 100%);
          background-size: 200% 100%;
          animation: shimmerMove 4s linear infinite;
        }
        @keyframes shimmerMove { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Lá + cánh hoa bay nghiêng */
        @keyframes leafDrift {
          0% { transform: translate(0,0) rotate(0deg); opacity:0.7; }
          50% { transform: translate(-20px,-30px) rotate(180deg); opacity:1; }
          100% { transform: translate(-40px,-60px) rotate(360deg); opacity:0.7; }
        }
        @keyframes petalDrift {
          0% { transform: translate(0,0) rotate(0deg); opacity:0.8; }
          50% { transform: translate(-15px,-20px) rotate(180deg); opacity:1; }
          100% { transform: translate(-30px,-40px) rotate(360deg); opacity:0.8; }
        }
      `}</style>
    </motion.div>
  );
}
