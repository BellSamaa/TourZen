// src/pages/Home.jsx
import React from "react";
import { motion } from "framer-motion";
import HeroSlider from "../components/HeroSlider";
import TourCard from "../components/TourCard";
import FlyingPlane from "../components/FlyingPlane";
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
    <motion.div initial="hidden" animate="visible" className="bg-gray-900 text-gray-100 relative overflow-hidden min-h-screen">

      {/* ✈️ Máy bay bay giữa màn hình */}
      <FlyingPlane />

      {/* 🌥️ Mây bay nền */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`cloud-${i}`}
            className="absolute bg-white rounded-full opacity-20 blur-2xl"
            style={{
              width: `${60 + Math.random() * 120}px`,
              height: `${20 + Math.random() * 50}px`,
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 100}%`,
              animation: `cloudDrift ${30 + Math.random() * 40}s linear infinite`,
              animationDelay: `${Math.random() * 40}s`,
            }}
          />
        ))}
      </div>

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
      <section
        className="max-w-7xl mx-auto px-6 py-20 relative z-10 rounded-3xl overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1470&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-3xl"></div>
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-center mb-12 text-yellow-400 glow-text relative z-10">
          🌟 Tour nổi bật
        </motion.h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
          {featured.map((t, i) => (
            <motion.div
              key={t.id}
              variants={fadeUp}
              custom={i}
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255,255,255,0.15)" }}
              className="transition-transform duration-300 relative tour-card-float bg-white/5 backdrop-blur-md rounded-xl p-2"
            >
              <TourCard tour={t} />
              <div className="absolute inset-0 pointer-events-none shimmer-overlay rounded-xl"></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ƯU ĐÃI ĐẶC BIỆT */}
      <section
        className="py-20 relative z-10 rounded-3xl overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1470&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-green-900/40 backdrop-blur-sm rounded-3xl"></div>
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-300 glow-text relative z-10">
          🔥 Ưu đãi đặc biệt
        </motion.h2>
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 px-6 relative z-10">
          {cheap.map((t, i) => (
            <motion.div
              key={t.id}
              variants={fadeUp}
              custom={i}
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255,255,255,0.12)" }}
              className="transition-transform duration-300 relative tour-card-float bg-white/5 backdrop-blur-md rounded-xl p-2"
            >
              <TourCard tour={t} />
              <div className="absolute inset-0 pointer-events-none shimmer-overlay rounded-xl"></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TOUR BÁN CHẠY */}
      <section
        className="max-w-7xl mx-auto px-6 py-20 relative z-10 rounded-3xl overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1470&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-sm rounded-3xl"></div>
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-center mb-12 text-purple-300 glow-text relative z-10">
          💯 Tour bán chạy
        </motion.h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
          {popular.map((t, i) => (
            <motion.div
              key={t.id}
              variants={fadeUp}
              custom={i}
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255,255,255,0.15)" }}
              className="transition-transform duration-300 relative tour-card-float bg-white/5 backdrop-blur-md rounded-xl p-2"
            >
              <TourCard tour={t} />
              <div className="absolute inset-0 pointer-events-none shimmer-overlay rounded-xl"></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CÁC SECTION KHÁC (Điểm đến, CTA, ...) */}
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

        /* Mây bay nền */
        @keyframes cloudDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(-120vw); }
        }
      `}</style>
    </motion.div>
  );
}
