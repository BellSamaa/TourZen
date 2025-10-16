// src/data/tours.js
// FILE DỮ LIỆU DUY NHẤT, HOÀN CHỈNH VÀ ĐỒNG BỘ CHO TOÀN BỘ WEBSITE

export const TOURS = [
  // Tour 1: Phan Thiết
  {
    id: 1,
    title: "Tour Phan Thiết - Mũi Né - Lâu Đài Rượu Vang",
    location: "Phan Thiết, Mũi Né",
    region: "Miền Nam",
    image: "/images/tour-phanthiet.jpg",
    galleryImages: ["/images/tour-phanthiet.jpg", "/images/gallery/phanthiet-1.jpg", "/images/gallery/phanthiet-2.jpg"],
    price: 3590000,
    duration: "4 ngày 3 đêm",
    rating: 4.8,
    isFeatured: true,
    isBestseller: false,
    description: "Tận hưởng biển xanh, cát trắng tại Mũi Né, khám phá đồi cát bay kỳ ảo và thưởng thức rượu vang hảo hạng tại lâu đài Sealinks.",
    itinerary: [
      { day: "Ngày 1", description: "TP.HCM - Phan Thiết - Mũi Né - Đồi Cát Bay." },
      { day: "Ngày 2", description: "Bàu Trắng - Lâu Đài Rượu Vang - Sealinks City." },
      { day: "Ngày 3", description: "Tự do khám phá hoặc tham quan các điểm lân cận." },
      { day: "Ngày 4", description: "Phan Thiết - TP.HCM. Mua sắm đặc sản." },
    ],
    departureMonths: [
      { month: "10/2025", departureDates: ["16/10", "18/10", "25/10"], prices: { adult: 3590000, child: 1795000, infant: 0, singleSupplement: 1200000 }, promotions: "🎁 Giảm 200.000đ/khách cho nhóm từ 4 người.", familySuitability: "👨‍👩‍👧‍👦 Phù hợp cho gia đình có trẻ nhỏ.", flightDeals: "✈️ Giá tour chưa bao gồm vé máy bay.", notes: "*Tự túc ăn chiều ngày thứ 3." },
      { month: "11/2025", departureDates: ["12/11", "19/11", "26/11"], prices: { adult: 3490000, child: 1745000, infant: 0, singleSupplement: 1100000 }, promotions: "🍂 Tặng voucher ăn tối hải sản 500.000đ.", familySuitability: "👫 Thích hợp cho cặp đôi, nhóm bạn.", flightDeals: "✈️ Giá tour chưa bao gồm vé máy bay.", notes: "*Chưa bao gồm chi phí lặn biển." },
      { month: "12/2025", departureDates: ["20/12", "24/12", "30/12"], prices: { adult: 3890000, child: 1945000, infant: 0, singleSupplement: 1300000 }, promotions: "🎄 Tặng kèm 1 chai rượu vang.", familySuitability: "👨‍👩‍👧‍👦 Lý tưởng cho nghỉ dưỡng cuối năm.", flightDeals: "✈️ Giá tour chưa bao gồm vé máy bay.", notes: "*Giá có thể tăng nhẹ vào dịp Lễ, Tết." },
      { month: "1/2026", departureDates: ["10/01", "17/01"], prices: { adult: 3990000, child: 1995000, infant: 0, singleSupplement: 1350000 }, promotions: "🧧 Du xuân nhận lì xì may mắn 200.000đ.", familySuitability: "👨‍👩‍👧‍👦 Cả gia đình cùng nhau du xuân.", flightDeals: "✈️ Giá tour chưa bao gồm vé máy bay.", notes: "*Tour Tết khởi hành theo lịch riêng." },
      { month: "2/2026", departureDates: ["14/02", "21/02"], prices: { adult: 3690000, child: 1845000, infant: 0, singleSupplement: 1250000 }, promotions: "❤️ Valentine ngọt ngào - Giảm 10% cho cặp đôi.", familySuitability: "👫 Chuyến đi lãng mạn cho 2 người.", flightDeals: "✈️ Giá tour chưa bao gồm vé máy bay.", notes: "*Áp dụng khi đặt trước ngày 10/02." }
    ]
  },
  // Tour 2: Phú Quốc
  {
    id: 2,
    title: "Khám Phá Đảo Ngọc Phú Quốc",
    location: "Phú Quốc, Kiên Giang",
    region: "Miền Nam",
    image: "/images/tour-phuquoc.jpg",
    galleryImages: ["/images/tour-phuquoc.jpg", "/images/gallery/phuquoc-1.jpg", "/images/gallery/phuquoc-2.jpg"],
    price: 4250000,
    duration: "3 ngày 2 đêm",
    rating: 4.9,
    isFeatured: true,
    isBestseller: true,
    description: "Đắm mình trong làn nước biển trong xanh tại Bãi Sao, khám phá thế giới san hô đầy màu sắc và thưởng thức hải sản tươi ngon.",
    itinerary: [
      { day: "Ngày 1", description: "Tham quan Đông đảo: Dinh Cậu, vườn tiêu, nhà thùng nước mắm." },
      { day: "Ngày 2", description: "Khám phá Nam đảo: Bãi Sao, nhà tù Phú Quốc, cáp treo Hòn Thơm." },
      { day: "Ngày 3", description: "Tự do mua sắm tại chợ đêm Dinh Cậu, khởi hành về lại." },
    ],
    departureMonths: [
      { month: "10/2025", departureDates: ["15/10", "22/10", "29/10"], prices: { adult: 4250000, child: 2125000, infant: 500000, singleSupplement: 1500000 }, promotions: "🎁 Tặng tour tham quan Grand World miễn phí.", familySuitability: "👨‍👩‍👧‍👦 Phù hợp cho mọi lứa tuổi.", flightDeals: "✈️ Vietnam Airlines & Vietjet Air bay thẳng.", notes: "*Chưa bao gồm vé Sun World Hòn Thơm." },
      { month: "11/2025", departureDates: ["10/11", "20/11", "30/11"], prices: { adult: 4150000, child: 2075000, infant: 500000, singleSupplement: 1400000 }, promotions: "☀️ Giảm 5% khi đặt tour online.", familySuitability: "👫 Thích hợp cho tuần trăng mật.", flightDeals: "✈️ Vietjet Air có vé bay đêm giá rẻ.", notes: "*Nên mang theo kem chống nắng." },
      { month: "12/2025", departureDates: ["18/12", "25/12", "28/12"], prices: { adult: 4550000, child: 2275000, infant: 500000, singleSupplement: 1600000 }, promotions: "🎉 Tặng vé xem pháo hoa tại Grand World.", familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm lễ hội sôi động.", flightDeals: "✈️ Giá vé máy bay tăng nhẹ.", notes: "*Chương trình pháo hoa có thể thay đổi." },
      { month: "1/2026", departureDates: ["08/01", "15/01", "22/01"], prices: { adult: 4850000, child: 2425000, infant: 500000, singleSupplement: 1700000 }, promotions: "🎊 Nâng hạng khách sạn miễn phí (tùy tình trạng).", familySuitability: "👨‍👩‍👧‍👦 Khởi đầu năm mới đẳng cấp.", flightDeals: "✈️ Bamboo Airways có nhiều vé ưu đãi sau Tết.", notes: "*Giá tour cao điểm dịp Tết Dương lịch." },
      { month: "2/2026", departureDates: ["12/02", "19/02", "26/02"], prices: { adult: 4350000, child: 2175000, infant: 500000, singleSupplement: 1550000 }, promotions: "❤️ Tặng bữa tối lãng mạn trên biển.", familySuitability: "👫 Điểm đến hoàn hảo cho Valentine.", flightDeals: "✈️ Combo vé + khách sạn ưu đãi.", notes: "*Áp dụng cho cặp đôi đặt trước 10/02." }
    ]
  },
  // Tour 3: Đà Nẵng
  {
    id: 3,
    title: "Đà Nẵng - Hội An - Bà Nà Hills",
    location: "Đà Nẵng, Hội An",
    region: "Miền Trung",
    image: "/images/tour-danang.jpg",
    galleryImages: ["/images/tour-danang.jpg", "/images/gallery/danang-1.jpg", "/images/gallery/danang-2.jpg"],
    price: 5100000,
    duration: "4 ngày 3 đêm",
    rating: 4.9,
    isFeatured: true,
    isBestseller: true,
    description: "Trải nghiệm thành phố đáng sống, dạo bước trên Cầu Vàng, khám phá phố cổ Hội An và thưởng thức ẩm thực đặc sắc.",
    itinerary: [
      { day: "Ngày 1", description: "Đón khách tại Đà Nẵng, tham quan bán đảo Sơn Trà, chùa Linh Ứng." },
      { day: "Ngày 2", description: "Khám phá Bà Nà Hills, Cầu Vàng, Làng Pháp." },
      { day: "Ngày 3", description: "Dạo chơi Phố cổ Hội An về đêm, đi thuyền thả hoa đăng." },
      { day: "Ngày 4", description: "Tự do tắm biển Mỹ Khê, mua sắm, tiễn sân bay." }
    ],
    departureMonths: [
      { month: "10/2025", departureDates: ["10/10", "24/10"], prices: { adult: 5100000, child: 2550000, infant: 500000, singleSupplement: 1800000 }, promotions: "✨ Tặng voucher show Ký Ức Hội An.", familySuitability: "👨‍👩‍👧‍👦 Phù hợp gia đình đa thế hệ.", flightDeals: "✈️ Nhiều chuyến bay giá rẻ.", notes: "*Đã bao gồm vé cáp treo Bà Nà." },
      { month: "11/2025", departureDates: ["07/11", "21/11"], prices: { adult: 4950000, child: 2475000, infant: 500000, singleSupplement: 1700000 }, promotions: "🍂 Tặng set trà chiều tại Hội An.", familySuitability: "👫 Cặp đôi tận hưởng không khí yên bình.", flightDeals: "✈️ Bamboo Airways có nhiều ưu đãi.", notes: "*Thời tiết có thể có mưa nhẹ." },
      { month: "12/2025", departureDates: ["12/12", "26/12"], prices: { adult: 5300000, child: 2650000, infant: 500000, singleSupplement: 1900000 }, promotions: "💡 Tham gia Lễ hội đèn lồng Hội An.", familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm văn hóa đặc sắc.", flightDeals: "✈️ Tăng cường chuyến bay cuối năm.", notes: "*Hội An rất đông vào dịp lễ hội." },
      { month: "1/2026", departureDates: ["09/01", "23/01"], prices: { adult: 5500000, child: 2750000, infant: 500000, singleSupplement: 2000000 }, promotions: " Tặng tour ẩm thực đường phố.", familySuitability: "👨‍👩‍👧‍👦 Khám phá ẩm thực phong phú.", flightDeals: "✈️ Đặt vé Tết sớm để có giá tốt.", notes: "*Một số quán ăn có thể đóng cửa dịp Tết." },
      { month: "2/2026", departureDates: ["13/02", "27/02"], prices: { adult: 5200000, child: 2600000, infant: 500000, singleSupplement: 1850000 }, promotions: "💖 Giảm 500.000đ cho cặp đôi.", familySuitability: "👫 Kỳ nghỉ lãng mạn tại thành phố đáng sống.", flightDeals: "✈️ Vietjet Air thường có vé 0đ sau Tết.", notes: "*Ưu đãi có giới hạn." }
    ]
  },
  // ... (Các tour còn lại được giữ nguyên cấu trúc chi tiết tương tự)
  // Tôi đã thêm isFeatured và isBestseller cho tất cả 20 tour
  
  // Tour 4: Hà Nội - Hạ Long
  {
    id: 4,
    title: "Hà Nội - Hạ Long - Ninh Bình",
    location: "Hà Nội, Vịnh Hạ Long, Ninh Bình",
    region: "Miền Bắc",
    image: "/images/tour-halong.jpg",
    galleryImages: ["/images/tour-halong.jpg", "/images/gallery/halong-1.jpg", "/images/gallery/halong-2.jpg"],
    price: 6200000,
    duration: "5 ngày 4 đêm",
    rating: 4.8,
    isFeatured: true,
    isBestseller: false,
    description: "Khám phá trọn vẹn vẻ đẹp Bắc Bộ với 36 phố phường Hà Nội, kỳ quan Vịnh Hạ Long và non nước hữu tình Ninh Bình.",
    itinerary: [
      { day: "Ngày 1", description: "Tham quan 36 phố phường Hà Nội, Lăng Bác, Hồ Gươm." },
      { day: "Ngày 2", description: "Du thuyền Vịnh Hạ Long, tham quan hang Sửng Sốt, chèo kayak." },
      { day: "Ngày 3", description: "Ngủ đêm trên du thuyền 5 sao giữa vịnh." },
      { day: "Ngày 4", description: "Khám phá Tràng An - Ninh Bình, ngồi thuyền xuyên hang động." },
      { day: "Ngày 5", description: "Chinh phục Hang Múa, ngắm toàn cảnh Tam Cốc, trở về Hà Nội." }
    ],
    departureMonths: [
      { month: "11/2025", departureDates: ["05/11", "19/11"], prices: { adult: 6200000, child: 3100000, infant: 600000, singleSupplement: 2500000 }, promotions: "🚢 Nâng hạng phòng du thuyền miễn phí.", familySuitability: "👨‍👩‍👧‍👦 Yêu thiên nhiên, lịch sử.", flightDeals: "✈️ Vietnam Airlines bay Nội Bài.", notes: "*Bao gồm 1 đêm trên du thuyền." },
      { month: "12/2025", departureDates: ["10/12", "24/12"], prices: { adult: 6500000, child: 3250000, infant: 600000, singleSupplement: 2600000 }, promotions: "❄️ Trải nghiệm Giáng sinh se lạnh.", familySuitability: "👨‍👩‍👧‍👦 Khám phá di sản thế giới.", flightDeals: "✈️ Vietjet Air có vé bay mùa đông.", notes: "*Nên mang theo áo ấm." },
      { month: "1/2026", departureDates: ["14/01", "28/01"], prices: { adult: 6800000, child: 3400000, infant: 600000, singleSupplement: 2700000 }, promotions: "🌸 Ngắm hoa đào nở sớm tại Ninh Bình.", familySuitability: "📸 Yêu thích vẻ đẹp mùa xuân.", flightDeals: "✈️ Giá vé cao điểm Tết.", notes: "*Lịch trình có thể thay đổi." },
      { month: "2/2026", departureDates: ["11/02", "25/02"], prices: { adult: 6400000, child: 3200000, infant: 600000, singleSupplement: 2550000 }, promotions: "🙏 Du xuân lễ chùa Bái Đính.", familySuitability: "🙏 Du xuân, cầu an đầu năm.", flightDeals: "✈️ Nhiều lựa chọn bay sau Tết.", notes: "*Bái Đính rất đông dịp đầu năm." },
      { month: "3/2026", departureDates: ["11/03", "25/03"], prices: { adult: 6100000, child: 3050000, infant: 600000, singleSupplement: 2450000 }, promotions: "🌿 Tiết trời mát mẻ, giảm 300.000đ.", familySuitability: "👨‍👩‍👧‍👦 Thời tiết đẹp, lý tưởng.", flightDeals: "✈️ Bamboo Airways có khuyến mãi.", notes: "*Thời điểm đẹp nhất trong năm." }
    ]
  },
  // Tour 5: Đà Lạt
  {
    id: 5,
    title: "Đà Lạt - Thành Phố Ngàn Hoa",
    location: "Đà Lạt, Lâm Đồng",
    region: "Miền Nam",
    image: "/images/tour-dalat.jpg",
    galleryImages: ["/images/tour-dalat.jpg", "/images/gallery/dalat-1.jpg", "/images/gallery/dalat-2.jpg"],
    price: 2990000,
    duration: "3 ngày 2 đêm",
    rating: 4.7,
    isFeatured: true,
    isBestseller: false,
    description: "Lạc bước giữa thành phố ngàn hoa với không khí se lạnh, những quán cà phê view đồi và các điểm check-in không thể bỏ lỡ.",
    itinerary: [
      { day: "Ngày 1", description: "Khám phá Thác Datanla, Thiền Viện Trúc Lâm, Hồ Tuyền Lâm." },
      { day: "Ngày 2", description: "Check-in tại Quảng trường Lâm Viên, Ga Đà Lạt, Vườn hoa thành phố." },
      { day: "Ngày 3", description: "Thưởng thức đặc sản tại chợ đêm Đà Lạt, mua sắm quà lưu niệm." }
    ],
    departureMonths: [
      { month: "10/2025", departureDates: ["11/10", "18/10", "25/10"], prices: { adult: 2990000, child: 1495000, infant: 0, singleSupplement: 800000 }, promotions: "🌸 Tặng vé vào cổng vườn hoa cẩm tú cầu.", familySuitability: "👫 Lý tưởng cho cặp đôi, nhóm bạn.", flightDeals: "✈️ Chưa bao gồm vé máy bay.", notes: "*Đà Lạt về đêm trời se lạnh." },
      { month: "11/2025", departureDates: ["08/11", "15/11", "22/11"], prices: { adult: 3100000, child: 1550000, infant: 0, singleSupplement: 850000 }, promotions: "🌼 Săn mùa hoa dã quỳ vàng rực.", familySuitability: "📸 Thiên đường cho người yêu chụp ảnh.", flightDeals: "✈️ Nhiều khuyến mãi bay Đà Lạt.", notes: "*Hoa dã quỳ đẹp nhất buổi sáng." },
      { month: "12/2025", departureDates: ["06/12", "13/12", "27/12"], prices: { adult: 3290000, child: 1645000, infant: 0, singleSupplement: 900000 }, promotions: "🎊 Tham gia Festival Hoa Đà Lạt (dự kiến).", familySuitability: "👨‍👩‍👧‍👦 Hòa mình vào không khí lễ hội.", flightDeals: "✈️ Giá vé máy bay tăng cao.", notes: "*Lịch trình có thể thay đổi theo sự kiện." },
      { month: "1/2026", departureDates: ["10/01", "24/01"], prices: { adult: 3400000, child: 1700000, infant: 0, singleSupplement: 950000 }, promotions: "🍓 Tặng tour tham quan và hái dâu.", familySuitability: "👨‍👩‍👧‍👦 Trẻ em sẽ rất thích thú.", flightDeals: "✈️ Vietjet Air có bay đêm giá tốt.", notes: "*Nên đặt tour sớm." },
      { month: "2/2026", departureDates: ["07/02", "21/02"], prices: { adult: 3350000, child: 1675000, infant: 0, singleSupplement: 920000 }, promotions: "☕ Tặng voucher cà phê view đẹp.", familySuitability: "👫 Tận hưởng không khí se lạnh.", flightDeals: "✈️ Giá vé ổn định sau Tết.", notes: "*Nhiều quán cà phê độc đáo." }
    ]
  },
  // Tour 6: Sapa
  {
    id: 6,
    title: "Sapa - Chinh Phục Fansipan",
    location: "Sapa, Lào Cai",
    region: "Miền Bắc",
    image: "/images/tour-sapa.jpg",
    galleryImages: ["/images/tour-sapa.jpg", "/images/gallery/sapa-1.jpg", "/images/gallery/sapa-2.jpg"],
    price: 4500000,
    duration: "3 ngày 2 đêm",
    rating: 4.8,
    isFeatured: true,
    isBestseller: false,
    description: "Chạm tay vào 'Nóc nhà Đông Dương', săn mây trên đỉnh Fansipan và khám phá nét văn hóa độc đáo của các dân tộc thiểu số.",
    itinerary: [
      { day: "Ngày 1", description: "Di chuyển Hà Nội - Sapa bằng xe giường nằm cao cấp." },
      { day: "Ngày 2", description: "Chinh phục 'Nóc nhà Đông Dương' bằng cáp treo Fansipan." },
      { day: "Ngày 3", description: "Tham quan bản Cát Cát, nhà thờ Đá, chợ Sapa." }
    ],
    departureMonths: [
        { month: "10/2025", departureDates: ["17/10", "31/10"], prices: { adult: 4300000, child: 2150000, infant: 500000, singleSupplement: 1400000 }, promotions: "🌾 Ngắm ruộng bậc thang cuối mùa.", familySuitability: "📸 Thiên đường nhiếp ảnh.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Thời tiết đẹp, mát mẻ." },
        { month: "11/2025", departureDates: ["14/11", "28/11"], prices: { adult: 4400000, child: 2200000, infant: 500000, singleSupplement: 1450000 }, promotions: "☁️ 'Săn mây' tại đỉnh Fansipan.", familySuitability: "🏞️ Dành cho người yêu cảnh quan hùng vĩ.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Cần chuẩn bị quần áo ấm." },
        { month: "12/2025", departureDates: ["05/12", "19/12"], prices: { adult: 4500000, child: 2250000, infant: 500000, singleSupplement: 1500000 }, promotions: "🧣 Tặng voucher thuê trang phục dân tộc.", familySuitability: "🏃‍♂️ Phù hợp du khách trẻ, yêu trekking.", flightDeals: "✈️ Hỗ trợ đặt vé máy bay đến Nội Bài.", notes: "*Khả năng có tuyết rơi." },
        { month: "1/2026", departureDates: ["09/01", "23/01"], prices: { adult: 4800000, child: 2400000, infant: 500000, singleSupplement: 1600000 }, promotions: "🌸 Ngắm hoa đào, hoa mận nở rộ.", familySuitability: "📸 Yêu thích vẻ đẹp mùa xuân Tây Bắc.", flightDeals: "✈️ Hỗ trợ đặt vé máy bay đến Nội Bài.", notes: "*Nhiệt độ rất thấp." },
        { month: "2/2026", departureDates: ["13/02", "27/02"], prices: { adult: 4600000, child: 2300000, infant: 500000, singleSupplement: 1550000 }, promotions: "🎊 Tham gia lễ hội mùa xuân.", familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm văn hóa đặc sắc.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Không khí lễ hội nhộn nhịp." }
    ]
  },
  // Tour 7: Quy Nhơn - Phú Yên
  {
    id: 7,
    title: "Quy Nhơn - Phú Yên - Xứ Nẫu Biển Xanh",
    location: "Quy Nhơn, Bình Định - Phú Yên",
    region: "Miền Trung",
    image: "/images/tour-quynhon.jpg",
    galleryImages: ["/images/tour-quynhon.jpg", "/images/gallery/quynhon-1.jpg", "/images/gallery/quynhon-2.jpg"],
    price: 3800000,
    duration: "4 ngày 3 đêm",
    rating: 4.7,
    isFeatured: false,
    isBestseller: false,
    description: "Hành trình về 'xứ Nẫu', chiêm ngưỡng Gành Đá Đĩa và thả hồn vào khung cảnh phim trường 'Tôi thấy hoa vàng trên cỏ xanh'.",
    itinerary: [
      { day: "Ngày 1", description: "Khám phá Eo Gió, Kỳ Co - 'Maldives của Việt Nam'." },
      { day: "Ngày 2", description: "Tham quan Tháp Đôi, Ghềnh Ráng Tiên Sa, mộ Hàn Mặc Tử." },
      { day: "Ngày 3", description: "Di chuyển đến Phú Yên, check-in tại Gành Đá Đĩa, Bãi Xép." },
      { day: "Ngày 4", description: "Tham quan Mũi Điện - cực Đông của Tổ quốc, Tháp Nghinh Phong." }
    ],
    departureMonths: [
        { month: "11/2025", departureDates: ["13/11", "27/11"], prices: { adult: 3800000, child: 1900000, infant: 400000, singleSupplement: 1200000 }, promotions: "🦞 Tặng bữa trưa hải sản tại Kỳ Co.", familySuitability: "👨‍👩‍👧‍👦 Yêu thích biển và hoạt động ngoài trời.", flightDeals: "✈️ Sân bay Phù Cát và Tuy Hòa.", notes: "*Yêu cầu thể lực tốt." },
        { month: "12/2025", departureDates: ["11/12", "25/12"], prices: { adult: 4000000, child: 2000000, infant: 400000, singleSupplement: 1300000 }, promotions: "📸 Tặng tour chụp ảnh miễn phí tại Bãi Xép.", familySuitability: "📸 Dành cho người đam mê nhiếp ảnh.", flightDeals: "✈️ Khuyến mãi cuối năm.", notes: "*Nên mang theo kính râm." },
        { month: "1/2026", departureDates: ["15/01", "29/01"], prices: { adult: 4200000, child: 2100000, infant: 400000, singleSupplement: 1400000 }, promotions: "🎆 Đón năm mới tại thành phố biển.", familySuitability: "👨‍👩‍👧‍👦 Lựa chọn mới mẻ cho kỳ nghỉ Tết.", flightDeals: "✈️ Cần đặt vé máy bay sớm.", notes: "*Thời tiết đẹp, nắng ấm." },
        { month: "2/2026", departureDates: ["12/02", "26/02"], prices: { adult: 3900000, child: 1950000, infant: 400000, singleSupplement: 1250000 }, promotions: "💖 Giảm 5% cho các cặp đôi.", familySuitability: "👫 Tận hưởng không gian riêng tư.", flightDeals: "✈️ Nhiều chuyến bay giá rẻ sau Tết.", notes: "*Các bãi biển vắng và đẹp." },
        { month: "3/2026", departureDates: ["12/03", "26/03"], prices: { adult: 3700000, child: 1850000, infant: 400000, singleSupplement: 1150000 }, promotions: "☀️ Mùa khô, giảm giá kích cầu.", familySuitability: "👨‍👩‍👧‍👦 Thời điểm lý tưởng.", flightDeals: "✈️ Vietjet và Bamboo có ưu đãi.", notes: "*Nắng có thể gắt." }
    ]
  },
  // Tour 8: Nha Trang
  {
    id: 8,
    title: "Nha Trang - VinWonders - Vịnh Biển Thiên Đường",
    location: "Nha Trang, Khánh Hòa",
    region: "Miền Trung",
    image: "/images/tour-nhatrang.jpg",
    galleryImages: ["/images/tour-nhatrang.jpg", "/images/gallery/nhatrang-1.jpg", "/images/gallery/nhatrang-2.jpg"],
    price: 3200000,
    duration: "3 ngày 2 đêm",
    rating: 4.8,
    isFeatured: false,
    isBestseller: false,
    description: "Vui chơi thả ga tại VinWonders, thư giãn với dịch vụ tắm bùn khoáng cao cấp và khám phá một trong những vịnh biển đẹp nhất thế giới.",
    itinerary: [
      { day: "Ngày 1", description: "Tham quan Viện Hải dương học, Chùa Long Sơn, Tháp Bà Ponagar." },
      { day: "Ngày 2", description: "Vui chơi không giới hạn tại VinWonders Nha Trang trên đảo Hòn Tre." },
      { day: "Ngày 3", description: "Thư giãn và tắm bùn khoáng tại khu du lịch Hòn Tằm." }
    ],
    departureMonths: [
        { month: "10/2025", departureDates: ["09/10", "23/10"], prices: { adult: 3200000, child: 1600000, infant: 300000, singleSupplement: 1000000 }, promotions: "🎢 Tặng voucher ẩm thực tại VinWonders.", familySuitability: "👨‍👩‍👧‍👦 Thiên đường giải trí cho gia đình.", flightDeals: "✈️ Sân bay Cam Ranh.", notes: "*Đã bao gồm vé VinWonders." },
        { month: "11/2025", departureDates: ["06/11", "20/11"], prices: { adult: 3100000, child: 1550000, infant: 300000, singleSupplement: 950000 }, promotions: "🌊 Giảm giá dịch vụ lặn biển.", familySuitability: "👨‍👩‍👧‍👦 Khám phá thế giới đại dương.", flightDeals: "✈️ Nhiều lựa chọn bay giá rẻ.", notes: "*Nên đặt trước dịch vụ lặn biển." },
        { month: "12/2025", departureDates: ["11/12", "25/12"], prices: { adult: 3400000, child: 1700000, infant: 300000, singleSupplement: 1100000 }, promotions: "🎄 Tham gia tiệc buffet Giáng sinh.", familySuitability: "👨‍👩‍👧‍👦 Đón Giáng sinh tại thành phố biển.", flightDeals: "✈️ Cần đặt vé sớm.", notes: "*Buffet Giáng sinh có phụ thu." },
        { month: "1/2026", departureDates: ["15/01", "29/01"], prices: { adult: 3600000, child: 1800000, infant: 300000, singleSupplement: 1200000 }, promotions: "🎆 Xem pháo hoa mừng năm mới.", familySuitability: "👨‍👩‍👧‍👦 Cùng nhau chào đón năm mới.", flightDeals: "✈️ Giá vé Tết cao.", notes: "*Trung tâm rất đông đêm giao thừa." },
        { month: "2/2026", departureDates: ["12/02", "26/02"], prices: { adult: 3300000, child: 1650000, infant: 300000, singleSupplement: 1050000 }, promotions: "💖 Trang trí phòng lãng mạn.", familySuitability: "👫 Kỳ nghỉ Valentine bên bờ biển.", flightDeals: "✈️ Giá vé sau Tết giảm mạnh.", notes: "*Yêu cầu trước dịch vụ trang trí." }
    ]
  },
  // Tour 9: Côn Đảo
  {
    id: 9,
    title: "Côn Đảo - Về Miền Đất Thiêng",
    location: "Côn Đảo, Bà Rịa - Vũng Tàu",
    region: "Miền Nam",
    image: "/images/tour-condao.jpg",
    galleryImages: ["/images/tour-condao.jpg", "/images/gallery/condao-1.jpg", "/images/gallery/condao-2.jpg"],
    price: 5500000,
    duration: "2 ngày 1 đêm",
    rating: 4.9,
    isFeatured: false,
    isBestseller: false,
    description: "Hành trình tâm linh về với miền đất thiêng, viếng mộ chị Võ Thị Sáu, tìm hiểu lịch sử đấu tranh hào hùng và khám phá vẻ đẹp hoang sơ của Côn Đảo.",
    itinerary: [
      { day: "Ngày 1", description: "Viếng Nghĩa trang Hàng Dương, mộ chị Võ Thị Sáu. Tham quan nhà tù." },
      { day: "Ngày 2", description: "Khám phá Bãi Đầm Trầu, lặn ngắm san hô tại Hòn Bảy Cạnh." }
    ],
    departureMonths: [
        { month: "11/2025", departureDates: ["08/11", "22/11"], prices: { adult: 5500000, child: 2750000, infant: 1000000, singleSupplement: 2000000 }, promotions: "🙏 Tặng bộ lễ viếng.", familySuitability: "🙏 Du lịch tâm linh, không hợp trẻ nhỏ.", flightDeals: "✈️ Đã bao gồm vé bay từ TP.HCM.", notes: "*Chuẩn bị trang phục lịch sự." },
        { month: "12/2025", departureDates: ["06/12", "20/12"], prices: { adult: 5600000, child: 2800000, infant: 1000000, singleSupplement: 2100000 }, promotions: "🕊️ Tour kết hợp lễ cầu siêu.", familySuitability: "🙏 Dành cho người muốn tìm về lịch sử.", flightDeals: "✈️ Đã bao gồm vé bay từ TP.HCM.", notes: "*Ít hoạt động giải trí về đêm." },
        { month: "1/2026", departureDates: ["10/01", "24/01"], prices: { adult: 5800000, child: 2900000, infant: 1000000, singleSupplement: 2200000 }, promotions: "✨ Tặng cẩm nang du lịch Côn Đảo.", familySuitability: "🙏 Chuyến đi ý nghĩa đầu năm.", flightDeals: "✈️ Đã bao gồm vé bay từ TP.HCM.", notes: "*Vé máy bay ra đảo có hạn." },
        { month: "2/2026", departureDates: ["07/02", "21/02"], prices: { adult: 5700000, child: 2850000, infant: 1000000, singleSupplement: 2150000 }, promotions: "🐢 Tìm hiểu về bảo tồn rùa biển.", familySuitability: "👨‍👩‍👧‍👦 Giáo dục về lịch sử, thiên nhiên.", flightDeals: "✈️ Đã bao gồm vé bay từ TP.HCM.", notes: "*Mùa rùa đẻ trứng vào mùa hè." },
        { month: "3/2026", departureDates: ["07/03", "21/03"], prices: { adult: 5400000, child: 2700000, infant: 1000000, singleSupplement: 1950000 }, promotions: "☀️ Mùa khô, giảm 200.000đ.", familySuitability: "👨‍👩‍👧‍👦 Thời tiết đẹp, thuận lợi.", flightDeals: "✈️ Đã bao gồm vé bay từ TP.HCM.", notes: "*Thời điểm tốt nhất để lặn biển." }
    ]
  },
  // Tour 10: Hà Giang
  {
    id: 10,
    title: "Hà Giang - Cung Đường Hạnh Phúc",
    location: "Hà Giang",
    region: "Miền Bắc",
    image: "/images/tour-hagiang.jpg",
    galleryImages: ["/images/tour-hagiang.jpg", "/images/gallery/hagiang-1.jpg", "/images/gallery/hagiang-2.jpg"],
    price: 3900000,
    duration: "4 ngày 3 đêm",
    rating: 4.9,
    isFeatured: true,
    isBestseller: true,
    description: "Chinh phục những cung đường đèo hùng vĩ, check-in Cột cờ Lũng Cú, đi thuyền trên sông Nho Quế và đắm chìm trong sắc hoa tam giác mạch.",
    itinerary: [
      { day: "Ngày 1", description: "Hà Nội - Hà Giang - Cổng trời Quản Bạ." },
      { day: "Ngày 2", description: "Dinh thự họ Vương, Cột cờ Lũng Cú, Phố cổ Đồng Văn." },
      { day: "Ngày 3", description: "Chinh phục Mã Pí Lèng, đi thuyền trên sông Nho Quế." },
      { day: "Ngày 4", description: "Hà Giang - Hà Nội, ngắm hoa tam giác mạch (vào mùa)." }
    ],
    departureMonths: [
        { month: "10/2025", departureDates: ["17/10", "31/10"], prices: { adult: 3900000, child: 1950000, infant: 400000, singleSupplement: 1000000 }, promotions: "🌸 Tặng tour chụp ảnh hoa tam giác mạch.", familySuitability: "🏞️ Yêu thích mạo hiểm, thiên nhiên.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Yêu cầu sức khỏe tốt." },
        { month: "11/2025", departureDates: ["07/11", "21/11"], prices: { adult: 4000000, child: 2000000, infant: 400000, singleSupplement: 1100000 }, promotions: "📸 Cuối mùa hoa, giảm 100.000đ.", familySuitability: "🏞️ Vẫn còn hoa nở muộn.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Thời tiết bắt đầu lạnh." },
        { month: "12/2025", departureDates: ["05/12", "19/12"], prices: { adult: 3800000, child: 1900000, infant: 400000, singleSupplement: 950000 }, promotions: "🌼 Ngắm mùa hoa cải vàng.", familySuitability: "🏞️ Cảnh sắc hùng vĩ mùa đông.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Rất lạnh, cần đồ chống rét." },
        { month: "1/2026", departureDates: ["16/01", "30/01"], prices: { adult: 4200000, child: 2100000, infant: 400000, singleSupplement: 1200000 }, promotions: "🌸 Săn hoa đào, hoa mận nở sớm.", familySuitability: "📸 Vẻ đẹp tinh khôi mùa xuân.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Theo dõi thông tin thời tiết." },
        { month: "2/2026", departureDates: ["13/02", "27/02"], prices: { adult: 4100000, child: 2050000, infant: 400000, singleSupplement: 1150000 }, promotions: "🎊 Tham gia lễ hội đầu xuân.", familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm không khí Tết vùng cao.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Thưởng thức món ăn ngày Tết." }
    ]
  },
  // Tour 11: Huế
  {
    id: 11,
    title: "Huế - Kinh Thành Cổ Kính",
    location: "Huế",
    region: "Miền Trung",
    image: "/images/tour-hue.jpg",
    galleryImages: ["/images/tour-hue.jpg", "/images/gallery/hue-1.jpg", "/images/gallery/hue-2.jpg"],
    price: 2800000,
    duration: "3 ngày 2 đêm",
    rating: 4.6,
    isFeatured: false,
    isBestseller: false,
    description: "Trở về quá khứ với kinh thành Huế uy nghiêm, lăng tẩm cổ kính và thả hồn theo điệu ca Huế trên dòng sông Hương thơ mộng.",
    itinerary: [
      { day: "Ngày 1", description: "Tham quan Đại Nội Huế, lăng Khải Định, lăng Minh Mạng." },
      { day: "Ngày 2", description: "Đi thuyền rồng trên sông Hương, nghe ca Huế." },
      { day: "Ngày 3", description: "Viếng Chùa Thiên Mụ, tham quan Làng hương Thủy Xuân." }
    ],
    departureMonths: [
        { month: "10/2025", departureDates: ["10/10", "24/10"], prices: { adult: 2700000, child: 1350000, infant: 300000, singleSupplement: 850000 }, promotions: "🍂 Tặng set trà, bánh cung đình.", familySuitability: "👫 Yêu thích sự yên tĩnh, cổ kính.", flightDeals: "✈️ Sân bay Phú Bài.", notes: "*Thời tiết mát mẻ." },
        { month: "11/2025", departureDates: ["07/11", "21/11"], prices: { adult: 2650000, child: 1325000, infant: 300000, singleSupplement: 800000 }, promotions: "🌧️ Mùa mưa, giảm giá 10%.", familySuitability: "📚 Khám phá văn hóa, lịch sử.", flightDeals: "✈️ Vé giá rẻ vào mùa này.", notes: "*Cần chuẩn bị ô dù." },
        { month: "12/2025", departureDates: ["04/12", "18/12"], prices: { adult: 2800000, child: 1400000, infant: 300000, singleSupplement: 900000 }, promotions: "👑 Tặng thuê áo dài, nón lá.", familySuitability: "👨‍👩‍👧‍👦 Yêu thích lịch sử, văn hóa.", flightDeals: "✈️ Sân bay Phú Bài.", notes: "*Thưởng thức đặc sản Huế." },
        { month: "1/2026", departureDates: ["08/01", "22/01"], prices: { adult: 3000000, child: 1500000, infant: 300000, singleSupplement: 1000000 }, promotions: "✨ Tặng tour làng nghề làm mứt gừng.", familySuitability: "👨‍👩‍👧‍👦 Tìm hiểu không khí Tết xứ Huế.", flightDeals: "✈️ Cần đặt vé Tết sớm.", notes: "*Mua các loại mứt Tết." },
        { month: "2/2026", departureDates: ["12/02", "26/02"], prices: { adult: 2900000, child: 1450000, infant: 300000, singleSupplement: 950000 }, promotions: "🙏 Du xuân, viếng chùa cầu an.", familySuitability: "🙏 Chuyến đi tâm linh đầu năm.", flightDeals: "✈️ Nhiều chuyến bay giá rẻ sau Tết.", notes: "*Không khí yên bình." }
    ]
  },
  // Tour 12: Miền Tây
  {
    id: 12,
    title: "Miền Tây - Trải Nghiệm Sông Nước",
    location: "Mỹ Tho, Bến Tre, Cần Thơ",
    region: "Miền Nam",
    image: "/images/tour-mientay.jpg",
    galleryImages: ["/images/tour-mientay.jpg", "/images/gallery/mientay-1.jpg", "/images/gallery/mientay-2.jpg"],
    price: 2500000,
    duration: "2 ngày 1 đêm",
    rating: 4.5,
    isFeatured: false,
    isBestseller: false,
    description: "Về với miền Tây sông nước, đi xuồng ba lá, nghe đờn ca tài tử, thưởng thức trái cây tại vườn và trải nghiệm chợ nổi Cái Răng.",
    itinerary: [
      { day: "Ngày 1", description: "Đi thuyền trên sông Tiền, tham quan 4 cồn Long, Lân, Quy, Phụng, nghe đờn ca tài tử." },
      { day: "Ngày 2", description: "Tham quan Chợ nổi Cái Răng (Cần Thơ) và trở về TP.HCM." }
    ],
    departureMonths: [
        { month: "11/2025", departureDates: ["01/11", "15/11", "29/11"], prices: { adult: 2500000, child: 1250000, infant: 0, singleSupplement: 700000 }, promotions: "🥥 Tặng 1 hộp kẹo dừa Bến Tre.", familySuitability: "👨‍👩‍👧‍👦 Phù hợp mọi lứa tuổi.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Đi chợ nổi vào sáng sớm." },
        { month: "12/2025", departureDates: ["06/12", "20/12"], prices: { adult: 2600000, child: 1300000, infant: 0, singleSupplement: 750000 }, promotions: "🍊 Mùa quýt hồng Lai Vung.", familySuitability: "👨‍👩‍👧‍👦 Tham quan vườn quýt.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Mua quýt tại vườn làm quà." },
        { month: "1/2026", departureDates: ["10/01", "24/01"], prices: { adult: 2800000, child: 1400000, infant: 0, singleSupplement: 800000 }, promotions: "🌸 Tham quan làng hoa Tết Sa Đéc.", familySuitability: "📸 Dành cho người yêu chụp ảnh.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Không khí Tết rộn ràng." },
        { month: "2/2026", departureDates: ["07/02", "21/02"], prices: { adult: 2700000, child: 1350000, infant: 0, singleSupplement: 780000 }, promotions: "🙏 Du xuân viếng Miếu Bà Chúa Xứ.", familySuitability: "🙏 Chuyến đi tâm linh đầu năm.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Tour kết hợp có thể kéo dài." },
        { month: "3/2026", departureDates: ["07/03", "21/03"], prices: { adult: 2400000, child: 1200000, infant: 0, singleSupplement: 650000 }, promotions: "☀️ Mùa khô, giảm giá 5%.", familySuitability: "👨‍👩‍👧‍👦 Thời tiết thuận lợi.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Ít mưa, dễ di chuyển." }
    ]
  },
  // Tour 13: Cát Bà
  {
    id: 13,
    title: "Hải Phòng - Cát Bà - Vịnh Lan Hạ",
    location: "Cát Bà, Hải Phòng",
    region: "Miền Bắc",
    image: "/images/tour-catba.jpg",
    galleryImages: ["/images/tour-catba.jpg", "/images/gallery/catba-1.jpg", "/images/gallery/catba-2.jpg"],
    price: 3100000,
    duration: "3 ngày 2 đêm",
    rating: 4.6,
    isFeatured: false,
    isBestseller: false,
    description: "Khám phá vẻ đẹp hoang sơ của Vịnh Lan Hạ, trekking Vườn Quốc gia Cát Bà và thư giãn trên những bãi biển trong xanh.",
    itinerary: [
      { day: "Ngày 1", description: "Hà Nội - Cát Bà, tắm biển tại bãi Cát Cò." },
      { day: "Ngày 2", description: "Du thuyền Vịnh Lan Hạ, làng chài Cái Bèo, chèo kayak." },
      { day: "Ngày 3", description: "Trekking Vườn Quốc gia, Pháo đài Thần công." }
    ],
    departureMonths: [
        { month: "4/2026", departureDates: ["11/04", "25/04"], prices: { adult: 3100000, child: 1550000, infant: 300000, singleSupplement: 1000000 }, promotions: "☀️ Giảm giá cho khách đặt sớm.", familySuitability: "👨‍👩‍👧‍👦 Tránh đông đúc trước lễ.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Thích hợp tắm biển." },
        { month: "5/2026", departureDates: ["09/05", "23/05"], prices: { adult: 3300000, child: 1650000, infant: 300000, singleSupplement: 1100000 }, promotions: "🚣 Tặng tour chèo kayak.", familySuitability: "👨‍👩‍👧‍👦 Kỳ nghỉ biển yên bình.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Cuối tuần khá đông khách." },
        { month: "6/2026", departureDates: ["06/06", "20/06"], prices: { adult: 3500000, child: 1750000, infant: 300000, singleSupplement: 1200000 }, promotions: "🏖️ Combo gia đình, giảm 10% trẻ em.", familySuitability: "👨‍👩‍👧‍👦 Kỳ nghỉ hè lý tưởng.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Cao điểm du lịch." },
        { month: "7/2026", departureDates: ["04/07", "18/07"], prices: { adult: 3600000, child: 1800000, infant: 300000, singleSupplement: 1250000 }, promotions: "🦑 Tặng tour câu mực đêm.", familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm thú vị.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Thời tiết nóng." },
        { month: "8/2026", departureDates: ["08/08", "22/08"], prices: { adult: 3400000, child: 1700000, infant: 300000, singleSupplement: 1150000 }, promotions: "✨ Cuối hè, giảm 200.000đ.", familySuitability: "👨‍👩‍👧‍👦 Tận hưởng ngày hè cuối.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Có thể có bão cuối tháng." }
    ]
  },
  // Tour 14: Mai Châu - Pù Luông
  {
    id: 14,
    title: "Mai Châu - Pù Luông - Về Chốn Bình Yên",
    location: "Mai Châu, Hòa Bình - Pù Luông, Thanh Hóa",
    region: "Miền Bắc",
    image: "/images/tour-puluong.jpg",
    galleryImages: ["/images/tour-puluong.jpg", "/images/gallery/puluong-1.jpg", "/images/gallery/puluong-2.jpg"],
    price: 2900000,
    duration: "3 ngày 2 đêm",
    rating: 4.8,
    isFeatured: false,
    isBestseller: false,
    description: "'Trốn phố về quê' với thung lũng Mai Châu, ruộng bậc thang Pù Luông mùa lúa chín và không khí trong lành của núi rừng.",
    itinerary: [
      { day: "Ngày 1", description: "Khám phá thung lũng Mai Châu, đạp xe qua bản Lác, Poom Cọong." },
      { day: "Ngày 2", description: "Trekking Khu bảo tồn Pù Luông, ngắm ruộng bậc thang." },
      { day: "Ngày 3", description: "Tham quan thác Hiêu và trở về Hà Nội." }
    ],
    departureMonths: [
        { month: "10/2025", departureDates: ["11/10", "25/10"], prices: { adult: 2900000, child: 1450000, infant: 0, singleSupplement: 800000 }, promotions: "🌾 Mùa lúa chín vàng.", familySuitability: "🏞️ Dành cho người muốn 'trốn phố'.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Nên mang giày trekking." },
        { month: "11/2025", departureDates: ["08/11", "22/11"], prices: { adult: 2800000, child: 1400000, infant: 0, singleSupplement: 750000 }, promotions: "🍂 Tiết trời thu, giảm 5%.", familySuitability: "👫 Thích hợp cho cặp đôi.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Thời tiết đẹp nhất trong năm." },
        { month: "12/2025", departureDates: ["13/12", "27/12"], prices: { adult: 2850000, child: 1425000, infant: 0, singleSupplement: 780000 }, promotions: "🔥 Đốt lửa trại, giao lưu văn nghệ.", familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm ấm cúng.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Cần mang áo ấm." },
        { month: "1/2026", departureDates: ["10/01", "24/01"], prices: { adult: 3000000, child: 1500000, infant: 0, singleSupplement: 850000 }, promotions: "🌸 Ngắm hoa mận, hoa đào.", familySuitability: "📸 Dành cho người yêu nhiếp ảnh.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Thời gian hoa nở có thể thay đổi." },
        { month: "2/2026", departureDates: ["14/02", "28/02"], prices: { adult: 2950000, child: 1475000, infant: 0, singleSupplement: 820000 }, promotions: "🎊 Tham gia lễ hội đầu năm.", familySuitability: "👨‍👩‍👧‍👦 Khám phá văn hóa bản địa.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Tham gia các trò chơi dân gian." }
    ]
  },
  // Tour 15: Phong Nha - Kẻ Bàng
  {
    id: 15,
    title: "Phong Nha - Vương Quốc Hang Động",
    location: "Phong Nha, Quảng Bình",
    region: "Miền Trung",
    image: "/images/tour-phongnha.jpg",
    galleryImages: ["/images/tour-phongnha.jpg", "/images/gallery/phongnha-1.jpg", "/images/gallery/phongnha-2.jpg"],
    price: 4200000,
    duration: "3 ngày 2 đêm",
    rating: 4.9,
    isFeatured: false,
    isBestseller: false,
    description: "Chiêm ngưỡng vẻ đẹp kỳ vĩ của Động Phong Nha và Động Thiên Đường, thử thách bản thân với Zipline và tắm bùn tại Hang Tối.",
    itinerary: [
      { day: "Ngày 1", description: "Tham quan Động Phong Nha - ngồi thuyền vào động." },
      { day: "Ngày 2", description: "Khám phá Động Thiên Đường - 'hoàng cung trong lòng đất'." },
      { day: "Ngày 3", description: "Zipline và tắm bùn tại Sông Chày - Hang Tối." }
    ],
    departureMonths: [
        { month: "12/2025", departureDates: ["06/12", "20/12"], prices: { adult: 4200000, child: 2100000, infant: 400000, singleSupplement: 1400000 }, promotions: "🏞️ Giảm 5% cho sinh viên.", familySuitability: "🧗‍♂️ Yêu thích khám phá, mạo hiểm.", flightDeals: "✈️ Sân bay Đồng Hới.", notes: "*Yêu cầu thể lực tốt." },
        { month: "1/2026", departureDates: ["10/01", "24/01"], prices: { adult: 4400000, child: 2200000, infant: 400000, singleSupplement: 1500000 }, promotions: "✨ Tặng đèn pin đội đầu.", familySuitability: "🧗‍♂️ Chuyến đi đầu năm hứng khởi.", flightDeals: "✈️ Cần đặt vé Tết sớm.", notes: "*Nhiệt độ trong hang mát mẻ." },
        { month: "2/2026", departureDates: ["14/02", "28/02"], prices: { adult: 4300000, child: 2150000, infant: 400000, singleSupplement: 1450000 }, promotions: "💖 Giảm 10% cho cặp đôi.", familySuitability: "👫 Khám phá kỳ quan tạo hóa.", flightDeals: "✈️ Nhiều chuyến bay giá rẻ sau Tết.", notes: "*Không phù hợp người sợ độ cao." },
        { month: "3/2026", departureDates: ["14/03", "28/03"], prices: { adult: 4100000, child: 2050000, infant: 400000, singleSupplement: 1350000 }, promotions: "☀️ Mùa khô, giảm 200.000đ.", familySuitability: "👨‍👩‍👧‍👦 Thời tiết thuận lợi.", flightDeals: "✈️ Vietjet và Bamboo có ưu đãi.", notes: "*Nên mang theo đồ bơi." },
        { month: "4/2026", departureDates: ["11/04", "25/04"], prices: { adult: 4500000, child: 2250000, infant: 400000, singleSupplement: 1600000 }, promotions: "🎉 Combo nghỉ lễ 30/4, tặng BBQ.", familySuitability: "👨‍👩‍👧‍👦 Kỳ nghỉ lễ đáng nhớ.", flightDeals: "✈️ Giá vé cao điểm.", notes: "*Phong Nha rất đông dịp lễ." }
    ]
  },
  // Tour 16: Lý Sơn
  {
    id: 16,
    title: "Đảo Lý Sơn - 'Vương quốc tỏi'",
    location: "Đảo Lý Sơn, Quảng Ngãi",
    region: "Miền Trung",
    image: "/images/tour-lyson.jpg",
    galleryImages: ["/images/tour-lyson.jpg", "/images/gallery/lyson-1.jpg", "/images/gallery/lyson-2.jpg"],
    price: 3500000,
    duration: "2 ngày 1 đêm",
    rating: 4.6,
    isFeatured: false,
    isBestseller: false,
    description: "Khám phá hòn đảo tiền tiêu, chiêm ngưỡng Cổng Tò Vò, lặn ngắm san hô ở Đảo Bé và thưởng thức đặc sản tỏi Lý Sơn.",
    itinerary: [
      { day: "Ngày 1", description: "Ra đảo lớn, tham quan Chùa Hang, Cổng Tò Vò, đỉnh Thới Lới." },
      { day: "Ngày 2", description: "Đi cano ra Đảo Bé, lặn ngắm san hô và trở về." }
    ],
    departureMonths: [
        { month: "11/2025", departureDates: ["14/11", "28/11"], prices: { adult: 3500000, child: 1750000, infant: 350000, singleSupplement: 1100000 }, promotions: "🧄 Tặng 1kg tỏi Lý Sơn.", familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm biển đảo hoang sơ.", flightDeals: "✈️ Bay đến sân bay Chu Lai.", notes: "*Biển có thể động." },
        { month: "12/2025", departureDates: ["12/12", "26/12"], prices: { adult: 3600000, child: 1800000, infant: 350000, singleSupplement: 1150000 }, promotions: "✨ Tặng tour ngắm hoàng hôn.", familySuitability: "📸 Dành cho người yêu bình minh, hoàng hôn.", flightDeals: "✈️ Theo dõi lịch tàu cao tốc.", notes: "*Mùa này vắng khách." },
        { month: "1/2026", departureDates: ["16/01", "30/01"], prices: { adult: 3800000, child: 1900000, infant: 350000, singleSupplement: 1200000 }, promotions: "🌿 Mùa trồng tỏi.", familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm độc đáo.", flightDeals: "✈️ Kết hợp tham quan Quảng Ngãi.", notes: "*Thưởng thức gỏi tỏi." },
        { month: "2/2026", departureDates: ["13/02", "27/02"], prices: { adult: 3700000, child: 1850000, infant: 350000, singleSupplement: 1180000 }, promotions: "💖 Tặng bữa tối hải sản.", familySuitability: "👫 Không gian lãng mạn, hoang sơ.", flightDeals: "✈️ Nhiều chuyến bay giá rẻ sau Tết.", notes: "*Nên đặt homestay view biển." },
        { month: "3/2026", departureDates: ["13/03", "27/03"], prices: { adult: 3400000, child: 1700000, infant: 350000, singleSupplement: 1050000 }, promotions: "☀️ Mùa khô, giảm 150.000đ.", familySuitability: "👨‍👩‍👧‍👦 Thời tiết đẹp, biển trong.", flightDeals: "✈️ Giá vé ổn định.", notes: "*Đảo Bé lặn ngắm san hô đẹp nhất." }
    ]
  },
  // Tour 17: Vũng Tàu
  {
    id: 17,
    title: "Vũng Tàu - Kỳ Nghỉ Cuối Tuần",
    location: "Vũng Tàu",
    region: "Miền Nam",
    image: "/images/tour-vungtau.jpg",
    galleryImages: ["/images/tour-vungtau.jpg", "/images/gallery/vungtau-1.jpg", "/images/gallery/vungtau-2.jpg"],
    price: 1500000,
    duration: "2 ngày 1 đêm",
    rating: 4.4,
    isFeatured: false,
    isBestseller: false,
    description: "Chuyến đi 'đổi gió' cuối tuần nhanh chóng, tận hưởng không khí biển, thưởng thức hải sản và check-in các điểm nổi tiếng.",
    itinerary: [
      { day: "Ngày 1", description: "Tắm biển Bãi Sau, tham quan Tượng Chúa Kitô Vua, Mũi Nghinh Phong." },
      { day: "Ngày 2", description: "Check-in ngọn hải đăng, thưởng thức bánh khọt và trở về." }
    ],
    departureMonths: [
        { month: "10/2025", departureDates: ["Mỗi cuối tuần"], prices: { adult: 1500000, child: 750000, infant: 0, singleSupplement: 500000 }, promotions: "☀️ Giảm 10% ngày trong tuần.", familySuitability: "👨‍👩‍👧‍👦 Chuyến đi ngắn ngày.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Đông vào cuối tuần." },
        { month: "11/2025", departureDates: ["Mỗi cuối tuần"], prices: { adult: 1450000, child: 725000, infant: 0, singleSupplement: 480000 }, promotions: "🦑 Tặng voucher ăn bánh khọt.", familySuitability: "👨‍👩‍👧‍👦 Đổi gió cuối tuần.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Có thể đặt tour riêng." },
        { month: "12/2025", departureDates: ["Mỗi cuối tuần"], prices: { adult: 1600000, child: 800000, infant: 0, singleSupplement: 550000 }, promotions: "🎄 Không khí Giáng sinh.", familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm Giáng sinh ở biển.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Nên đặt sớm cuối năm." },
        { month: "1/2026", departureDates: ["Mỗi cuối tuần"], prices: { adult: 1700000, child: 850000, infant: 0, singleSupplement: 600000 }, promotions: "🎆 Đón năm mới trên biển.", familySuitability: "👨‍👩‍👧‍👦 Cùng chào đón năm mới.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Giá cao điểm Tết Dương lịch." },
        { month: "2/2026", departureDates: ["Mỗi cuối tuần"], prices: { adult: 1550000, child: 775000, infant: 0, singleSupplement: 520000 }, promotions: "💖 Giảm 5% cho cặp đôi.", familySuitability: "👫 Chuyến đi ngắn ngày lãng mạn.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Nhiều lựa chọn khách sạn." }
    ]
  },
  // Tour 18: Tây Nguyên
  {
    id: 18,
    title: "Tây Nguyên - Tiếng Gọi Đại Ngàn",
    location: "Buôn Ma Thuột, Đắk Lắk",
    region: "Miền Trung",
    image: "/images/tour-taynguyen.jpg",
    galleryImages: ["/images/tour-taynguyen.jpg", "/images/gallery/taynguyen-1.jpg", "/images/gallery/taynguyen-2.jpg"],
    price: 3200000,
    duration: "3 ngày 2 đêm",
    rating: 4.7,
    isFeatured: false,
    isBestseller: false,
    description: "Lắng nghe tiếng gọi đại ngàn, khám phá thủ phủ cà phê, chiêm ngưỡng thác hùng vĩ và trải nghiệm văn hóa cồng chiêng.",
    itinerary: [
      { day: "Ngày 1", description: "Tham quan Làng cà phê Trung Nguyên, Bảo tàng Thế giới Cà phê." },
      { day: "Ngày 2", description: "Khám phá cụm thác Dray Nur, Dray Sáp." },
      { day: "Ngày 3", description: "Trải nghiệm cưỡi voi, đi thuyền độc mộc tại Hồ Lắk." }
    ],
    departureMonths: [
        { month: "11/2025", departureDates: ["14/11", "28/11"], prices: { adult: 3200000, child: 1600000, infant: 300000, singleSupplement: 900000 }, promotions: "☕ Tặng 1 ly cà phê chồn.", familySuitability: "👨‍👩‍👧‍👦 Yêu thiên nhiên, văn hóa.", flightDeals: "✈️ Sân bay Buôn Ma Thuột.", notes: "*Thử gà nướng cơm lam." },
        { month: "12/2025", departureDates: ["12/12", "26/12"], prices: { adult: 3300000, child: 1650000, infant: 300000, singleSupplement: 950000 }, promotions: "🌼 Mùa hoa dã quỳ.", familySuitability: "📸 Thiên đường chụp ảnh.", flightDeals: "✈️ Vietjet có vé giá rẻ.", notes: "*Hoa đẹp nhất buổi sáng." },
        { month: "1/2026", departureDates: ["16/01", "30/01"], prices: { adult: 3500000, child: 1750000, infant: 300000, singleSupplement: 1000000 }, promotions: "🎊 Tham gia lễ hội mừng năm mới.", familySuitability: "👨‍👩‍👧‍👦 Tìm hiểu văn hóa cồng chiêng.", flightDeals: "✈️ Cần đặt vé Tết sớm.", notes: "*Tham gia Lễ hội Cà phê (nếu có)." },
        { month: "2/2026", departureDates: ["13/02", "27/02"], prices: { adult: 3400000, child: 1700000, infant: 300000, singleSupplement: 980000 }, promotions: "🐘 Tặng voucher giảm giá cưỡi voi.", familySuitability: "👨‍👩‍👧‍👦 Trẻ em sẽ thích thú.", flightDeals: "✈️ Giá vé sau Tết hợp lý.", notes: "*Chọn nơi cưỡi voi nhân đạo." },
        { month: "3/2026", departureDates: ["13/03", "27/03"], prices: { adult: 3100000, child: 1550000, infant: 300000, singleSupplement: 850000 }, promotions: "☕ Mùa hoa cà phê nở trắng.", familySuitability: "📸 Cảnh tượng tuyệt đẹp.", flightDeals: "✈️ Bamboo Airways có ưu đãi.", notes: "*Hoa cà phê có hương thơm." }
    ]
  },
  // Tour 19: Mộc Châu
  {
    id: 19,
    title: "Mộc Châu - Thảo Nguyên Xanh Mướt",
    location: "Mộc Châu, Sơn La",
    region: "Miền Bắc",
    image: "/images/tour-mocchau.jpg",
    galleryImages: ["/images/tour-mocchau.jpg", "/images/gallery/mocchau-1.jpg", "/images/gallery/mocchau-2.jpg"],
    price: 2500000,
    duration: "2 ngày 1 đêm",
    rating: 4.7,
    isFeatured: false,
    isBestseller: false,
    description: "Đắm mình trong vẻ đẹp của đồi chè trái tim, khám phá thung lũng hoa mận trắng xóa và tận hưởng không khí trong lành.",
    itinerary: [
      { day: "Ngày 1", description: "Hà Nội - Mộc Châu, check-in đồi chè trái tim, thác Dải Yếm." },
      { day: "Ngày 2", description: "Tham quan rừng thông Bản Áng, thung lũng mận Nà Ka." }
    ],
    departureMonths: [
        { month: "11/2025", departureDates: ["08/11", "22/11"], prices: { adult: 2500000, child: 1250000, infant: 0, singleSupplement: 700000 }, promotions: "🌼 Mùa hoa cải trắng.", familySuitability: "📸 Thiên đường 'sống ảo'.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Nên thuê xe máy." },
        { month: "12/2025", departureDates: ["13/12", "27/12"], prices: { adult: 2600000, child: 1300000, infant: 0, singleSupplement: 750000 }, promotions: "🍓 Tham quan, hái dâu tây.", familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm thú vị cho trẻ em.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Thời tiết rất lạnh." },
        { month: "1/2026", departureDates: ["17/01", "31/01"], prices: { adult: 2800000, child: 1400000, infant: 0, singleSupplement: 800000 }, promotions: "🌸 Mùa hoa đào, hoa mận.", familySuitability: "📸 Cảnh sắc mùa xuân như tranh.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Mùa đẹp nhất trong năm." },
        { month: "2/2026", departureDates: ["14/02", "28/02"], prices: { adult: 2700000, child: 1350000, infant: 0, singleSupplement: 780000 }, promotions: "💖 Tặng hộp mứt mận.", familySuitability: "👫 Điểm đến lãng mạn.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Hoa vẫn còn nở đẹp." },
        { month: "3/2026", departureDates: ["14/03", "28/03"], prices: { adult: 2400000, child: 1200000, infant: 0, singleSupplement: 650000 }, promotions: "🌿 Mùa hoa ban nở.", familySuitability: "🏞️ Tận hưởng không khí trong lành.", flightDeals: "✈️ Khởi hành từ Hà Nội.", notes: "*Thời tiết dễ chịu." }
    ]
  },
  // Tour 20: Cần Thơ - Châu Đốc
  {
    id: 20,
    title: "Cần Thơ - Châu Đốc - Hành Trình Tâm Linh",
    location: "Cần Thơ, An Giang",
    region: "Miền Nam",
    image: "/images/tour-chaudoc.jpg",
    galleryImages: ["/images/tour-chaudoc.jpg", "/images/gallery/chaudoc-1.jpg", "/images/gallery/chaudoc-2.jpg"],
    price: 2800000,
    duration: "3 ngày 2 đêm",
    rating: 4.6,
    isFeatured: false,
    isBestseller: false,
    description: "Khám phá văn hóa sông nước Cần Thơ, du lịch tâm linh tại Châu Đốc, viếng Miếu Bà Chúa Xứ và khám phá rừng tràm Trà Sư.",
    itinerary: [
      { day: "Ngày 1", description: "Tham quan Chợ nổi Cái Răng, Thiền viện Trúc Lâm Phương Nam." },
      { day: "Ngày 2", description: "Di chuyển đến Châu Đốc, viếng Miếu Bà Chúa Xứ Núi Sam." },
      { day: "Ngày 3", description: "Khám phá Rừng tràm Trà Sư và mua sắm đặc sản mắm." }
    ],
    departureMonths: [
        { month: "10/2025", departureDates: ["18/10", "25/10"], prices: { adult: 2800000, child: 1400000, infant: 0, singleSupplement: 800000 }, promotions: "🌊 Mùa nước nổi.", familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm mùa nước nổi.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Rừng tràm đẹp nhất mùa này." },
        { month: "11/2025", departureDates: ["15/11", "29/11"], prices: { adult: 2750000, child: 1375000, infant: 0, singleSupplement: 780000 }, promotions: "✨ Tặng nón lá, khăn rằn.", familySuitability: "👨‍👩‍👧‍👦 Tìm hiểu văn hóa Nam Bộ.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Thử bún cá, lẩu mắm." },
        { month: "12/2025", departureDates: ["13/12", "27/12"], prices: { adult: 2850000, child: 1425000, infant: 0, singleSupplement: 820000 }, promotions: "✨ Tặng voucher mua mắm.", familySuitability: "🙏 Chuyến đi cuối năm, cầu bình an.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Châu Đốc là 'vương quốc mắm'." },
        { month: "1/2026", departureDates: ["10/01", "24/01"], prices: { adult: 3000000, child: 1500000, infant: 0, singleSupplement: 900000 }, promotions: "🙏 Cao điểm Vía Bà.", familySuitability: "🙏 Dành cho khách hành hương.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Miếu Bà rất đông." },
        { month: "2/2026", departureDates: ["14/02", "28/02"], prices: { adult: 2900000, child: 1450000, infant: 0, singleSupplement: 850000 }, promotions: "🙏 Du xuân đầu năm, giảm 5%.", familySuitability: "🙏 Chuyến đi cầu may mắn.", flightDeals: "✈️ Khởi hành từ TP.HCM bằng xe.", notes: "*Không khí du xuân nhộn nhịp." }
    ]
  },
];