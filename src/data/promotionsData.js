// src/data/promotionsData.js

export const PROMOTIONS = {
  events: [
    {
      id: 1,
      title: 'Đại Lễ 2/9',
      description: 'Vi vu không lo về giá, giảm đến 30% tour toàn quốc.',
      // (SỬA) Đổi link Unsplash sang local
      image: '/images/promotions/dai-le-2-9.jpg',
      tag: 'Lễ 2/9',
      timeLimit: 'Còn 3 ngày',
      voucherCode: 'LEQUOCKHANH',
      discountPercent: 30,
    },
    {
      id: 2,
      title: 'Chào hè rực rỡ',
      description: 'Ưu đãi đặc biệt cho các tour biển đảo. Tặng voucher lặn biển.',
      // (SỬA) Đổi link Unsplash sang local
      image: '/images/promotions/chao-he-ruc-ro.jpg',
      tag: 'Tour hè',
      timeLimit: 'Đến 31/08',
      voucherCode: 'HEVUI',
      discountPercent: 20,
      quantityLimit: true,
    },
  ],
  regions: [
    {
      id: 3,
      title: 'Khám phá Miền Trung',
      description: 'Hành trình di sản Đà Nẵng - Huế - Hội An giảm ngay 25%.',
      // (SỬA) Đổi link Unsplash sang local
      image: '/images/promotions/mien-trung.jpg',
      tag: 'Miền Trung',
      timeLimit: 'Vô thời hạn',
      voucherCode: 'DISANMT',
      discountPercent: 25,
    },
    {
      id: 4,
      title: 'Tây Bắc Mùa Lúa Chín',
      description: 'Săn mây Tà Xùa, khám phá Mù Cang Chải với giá siêu hấp dẫn.',
      // (SỬA) Đổi link Unsplash sang local
      image: '/images/promotions/tay-bac-mua-vang.jpg',
      tag: 'Miền Bắc',
      timeLimit: 'Đến 30/10',
      voucherCode: 'MUAVANG',
      discountPercent: 15,
      quantityLimit: true,
    },
  ],
  thematic: [
    {
      id: 5,
      title: 'Một vòng Việt Nam',
      description: 'Hành trình xuyên Việt 14 ngày, khám phá mọi miền Tổ quốc.',
      // (SỬA) Đổi link Unsplash sang local
      image: '/images/promotions/xuyen-viet.jpg',
      tag: 'Xuyên Việt',
      timeLimit: 'Ưu đãi tháng này',
      voucherCode: 'VIETNAMOI',
      discountPercent: 10,
    },
  ],
};