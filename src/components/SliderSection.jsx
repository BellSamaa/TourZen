import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

export default function SliderSection({ items = [] }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3800 }}
        slidesPerView={1}
        spaceBetween={12}
      >
        {items.map((it) => (
          <SwiperSlide key={it.id}>
            <div className="hero-slide" style={{ backgroundImage: `url(${it.img})` }}>
              <div className="hero-content">
                <h3>{it.title}</h3>
                <p>{it.region} • {it.days} ngày — {new Intl.NumberFormat("vi-VN").format(it.price)}đ</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
