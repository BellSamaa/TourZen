import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const slides = [
  {
    image: "/images/phuquoc.jpg",
    title: "Thiên đường biển Phú Quốc chờ bạn",
    desc: "Đặt tour nhanh — thanh toán linh hoạt — trải nghiệm không giới hạn 🌍",
  },
  {
    image: "/images/halong.jpg",
    title: "Hạ Long — Kỳ quan thiên nhiên thế giới",
    desc: "Khám phá di sản thiên nhiên kỳ vĩ với hành trình đáng nhớ cùng TourZen",
  },
  {
    image: "/images/dalat.jpg",
    title: "Đà Lạt — Thành phố ngàn hoa",
    desc: "Không khí se lạnh, rừng thông và những cánh đồng hoa rực rỡ đang chờ bạn",
  },
];

export default function HeroSlider() {
  return (
    <div className="relative w-full h-[80vh]">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="w-full h-full"
      >
        {slides.map((s, i) => (
          <SwiperSlide key={i}>
            <div
              className="w-full h-full bg-cover bg-center relative"
              style={{ backgroundImage: `url(${s.image})` }}
            >
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white px-4">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
                  {s.title}
                </h1>
                <p className="text-lg md:text-xl mb-6">{s.desc}</p>
                <a
                  href="/tours"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-all"
                >
                  Khám phá ngay
                </a>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
