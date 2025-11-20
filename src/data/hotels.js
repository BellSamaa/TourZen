// Thêm vào file src/data/hotels.js (hoặc file dữ liệu của bạn)
export const HOTELS_DATA = [
  {
    id: 'HN001', // Mã khách sạn (dùng làm tour_code)
    name: 'Khách sạn Metropole Hà Nội',
    price: 5500000, // Giá mỗi đêm
    image_url: '/images/hotel-metropole.jpg', // Đường dẫn ảnh
    description: 'Khách sạn lịch sử sang trọng bậc nhất tại trung tâm Hà Nội, gần Hồ Gươm và Nhà hát Lớn.',
    duration: 'Giá / đêm', // Hoặc để trống
    location: 'Hà Nội',
    rating: 5.0,
    inventory: 50, // Số phòng trống (ví dụ)
    product_type: 'hotel', // Quan trọng
    // supplier_id: null, // Có thể bỏ trống hoặc chọn sau
    galleryImages: ['/images/hotel-metropole.jpg', '/images/gallery/metropole-1.jpg', '/images/gallery/metropole-2.jpg'] // Mảng ảnh
  },
  {
    id: 'DN001',
    name: 'InterContinental Danang Sun Peninsula Resort',
    price: 8200000,
    image_url: '/images/hotel-intercondanang.jpg',
    description: 'Khu nghỉ dưỡng đẳng cấp quốc tế tọa lạc trên bán đảo Sơn Trà, với tầm nhìn tuyệt đẹp ra biển.',
    duration: 'Giá / đêm',
    location: 'Đà Nẵng',
    rating: 5.0,
    inventory: 30,
    product_type: 'hotel',
    galleryImages: ['/images/hotel-intercondanang.jpg', '/images/gallery/intercondanang-1.jpg']
  },
  {
    id: 'PQ001',
    name: 'JW Marriott Phu Quoc Emerald Bay Resort & Spa',
    price: 6800000,
    image_url: '/images/hotel-jwmarriott-pq.jpg',
    description: 'Thiết kế độc đáo như một trường đại học giả tưởng tại Bãi Khem, Phú Quốc. Trải nghiệm nghỉ dưỡng khác biệt.',
    duration: 'Giá / đêm',
    location: 'Phú Quốc',
    rating: 5.0,
    inventory: 40,
    product_type: 'hotel',
  },
  {
    id: 'SG001',
    name: 'The Reverie Saigon',
    price: 7100000,
    image_url: '/images/hotel-reverie-sg.jpg',
    description: 'Khách sạn xa hoa bậc nhất Sài Gòn với nội thất Ý tinh xảo, nằm tại vị trí đắc địa quận 1.',
    duration: 'Giá / đêm',
    location: 'TP. Hồ Chí Minh',
    rating: 5.0,
    inventory: 60,
    product_type: 'hotel',
  },
  {
    id: 'NT001',
    name: 'Amiana Resort Nha Trang',
    price: 4300000,
    image_url: '/images/hotel-amiana-nt.jpg',
    description: 'Ốc đảo nghỉ dưỡng yên bình với bãi biển riêng và hồ bơi nước biển tự nhiên lớn nhất Việt Nam.',
    duration: 'Giá / đêm',
    location: 'Nha Trang',
    rating: 4.9,
    inventory: 45,
    product_type: 'hotel',
    galleryImages: ['/images/hotel-amiana-nt.jpg']
  },
  {
    id: 'HA001',
    name: 'Silk Path Grand Hue Hotel & Spa',
    price: 2100000,
    image_url: '/images/hotel-silkpath-hue.jpg',
    description: 'Khách sạn mang đậm nét kiến trúc Đông Dương cổ kính, gần sông Hương và Đại Nội Huế.',
    duration: 'Giá / đêm',
    location: 'Huế',
    rating: 4.8,
    inventory: 55,
    product_type: 'hotel',
  },
   {
    id: 'SP001',
    name: 'Hotel de la Coupole - MGallery',
    price: 3800000,
    image_url: '/images/hotel-lacoupole-sapa.jpg',
    description: 'Kiệt tác kiến trúc Pháp giữa lòng Sapa mù sương, kết nối trực tiếp với ga tàu hỏa leo núi Mường Hoa.',
    duration: 'Giá / đêm',
    location: 'Sapa',
    rating: 4.9,
    inventory: 35,
    product_type: 'hotel',
  },
];