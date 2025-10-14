import React from "react";
import { motion } from "framer-motion";
import HeroSlider from "../components/HeroSlider";
import TourCard from "../components/TourCard";
import { TOURS } from "../data/tours";

// Animation cho từng section
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
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
    <motion.div
      initial="hidden"
      animate="visible"
      className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
    >
      {/* ✅ HERO SLIDER */}
      <section className="relative w-full h-[85vh] overflow-hidden">
        <HeroSlider />
      </section>

      {/* 🌟 TOUR NỔI BẬT */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white"
        >
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
            >
              <TourCard tour={t} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🔥 ƯU ĐÃI ĐẶC BIỆT */}
      <section className="bg-gradient-to-r from-sky-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 py-20">
        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-sky-600 dark:text-blue-300"
        >
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
            >
              <TourCard tour={t} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 💯 TOUR BÁN CHẠY */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-amber-600"
        >
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
            >
              <TourCard tour={t} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ✈️ CTA CUỐI TRANG */}
      <section className="bg-sky-600 text-white py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 px-4">
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Sẵn sàng cho hành trình tiếp theo?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="mb-8 text-lg opacity-90 max-w-2xl mx-auto"
          >
            Hàng ngàn tour du lịch đang chờ bạn khám phá cùng{" "}
            <span className="font-semibold text-white">TourZen</span> ✈️
          </motion.p>
          <motion.a
            href="/tours"
            variants={fadeUp}
            custom={2}
            className="inline-block bg-white text-sky-700 font-semibold px-8 py-3 rounded-full hover:bg-sky-50 transition-all shadow-lg"
          >
            Xem tất cả tour
          </motion.a>
        </div>
      </section>
    </motion.div>
  );
}