// src/data/promotionsData.js
const promotionsData = {
  events: [
    {
      id: 1,
      title: "Đại Lễ 2/9",
      description: "Vi vu không lo về giá, giảm đến 30% tour toàn quốc.",
      image: "https://images.unsplash.com/photo-1597093278291-a205a1e7a36f?q=80&w=2070",
      tag: "Lễ 2/9",
      timeLimit: "Còn 3 ngày",
      voucherCode: "LEQUOCKHANH",
      discountPercent: 30,
    },
    {
      id: 2,
      title: "Chào hè rực rỡ",
      description: "Ưu đãi đặc biệt cho các tour biển đảo. Tặng voucher lặn biển.",
      image: "https://images.unsplash.com/photo-1507525428034-b723a996f6ea?q=80&w=2070",
      tag: "Tour hè",
      timeLimit: "Đến 31/08",
      voucherCode: "HEVUI",
      discountPercent: 20,
      quantityLimit: true,
    },
  ],
  regions: [
    {
      id: 3,
      title: "Khám phá Miền Trung",
      description: "Hành trình di sản Đà Nẵng - Huế - Hội An giảm ngay 25%.",
      image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070",
      tag: "Miền Trung",
      timeLimit: "Vô thời hạn",
      voucherCode: "DISANMT",
      discountPercent: 25,
    },
    {
      id: 4,
      title: "Tây Bắc Mùa Lúa Chín",
      description: "Săn mây Tà Xùa, khám phá Mù Cang Chải với giá siêu hấp dẫn.",
      image: "https://images.unsplash.com/photo-1627993322198-281b6ac5a42b?q=80&w=2072",
      tag: "Miền Bắc",
      timeLimit: "Đến 30/10",
      voucherCode: "MUAVANG",
      discountPercent: 15,
      quantityLimit: true,
    },
  ],
  thematic: [
    {
      id: 5,
      title: "Một vòng Việt Nam",
      description: "Hành trình xuyên Việt 14 ngày, khám phá mọi miền Tổ quốc.",
      image: "https://images.unsplash.com/photo-1543973156-3804b81a7351?q=80&w=2070",
      tag: "Xuyên Việt",
      timeLimit: "Ưu đãi tháng này",
      voucherCode: "VIETNAMOI",
      discountPercent: 10,
    },
  ],
};

export const PROMOTIONS = [];

