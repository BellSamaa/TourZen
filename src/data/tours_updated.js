// Dữ liệu đầy đủ cho 20 tour, sẵn sàng để sử dụng.
// Cấu trúc đã được hoàn thiện để chứa thông tin chi tiết cho từng tháng.

export const TOURS = [
  // Tour 1: Phan Thiết
  {
    id: 1,
    title: "Tour Du Lịch Phan Thiết - Mũi Né - Lâu Đài Rượu Vang",
    location: "Phan Thiết, Mũi Né",
    image: "/images/tour-phanthiet.jpg",
    price: "3.590.000",
    duration: "4 ngày 3 đêm",
    rating: 4.8,
    itinerary: [
      "TP.HCM - Phan Thiết - Mũi Né - Đồi Cát Bay.",
      "Bàu Trắng - Lâu Đài Rượu Vang - Sealinks City.",
      "Tự do khám phá hoặc tham quan các điểm lân cận.",
      "Phan Thiết - TP.HCM. Mua sắm đặc sản.",
    ],
    departureMonths: [
      {
        month: "10/2025",
        departureDates: ["16/10/2025", "18/10/2025", "25/10/2025"],
        prices: { adult: 3590000, child: 1795000, infant: 0, singleSupplement: 1200000 },
        promotions: "🎁 Giảm 200.000đ/khách cho nhóm từ 4 người.",
        familySuitability: "👨‍👩‍👧‍👦 Phù hợp cho gia đình 3-5 người, có trẻ nhỏ.",
        flightDeals: "✈️ Giá tour chưa bao gồm vé máy bay.",
        notes: "*Tự túc ăn chiều ngày thứ 3 và vé Vinwonder."
      },
      {
        month: "11/2025",
        departureDates: ["12/11/2025", "19/11/2025", "26/11/2025"],
        prices: { adult: 3490000, child: 1745000, infant: 0, singleSupplement: 1100000 },
        promotions: "🍂 Mùa thu vàng - Tặng voucher ăn tối hải sản 500.000đ.",
        familySuitability: "👫 Thích hợp cho cặp đôi hoặc nhóm bạn trẻ.",
        flightDeals: "✈️ Giá tour chưa bao gồm vé máy bay.",
        notes: "*Chưa bao gồm chi phí lặn biển và các trò chơi cảm giác mạnh."
      },
      {
        month: "12/2025",
        departureDates: ["20/12/2025", "24/12/2025", "30/12/2025"],
        prices: { adult: 3890000, child: 1945000, infant: 0, singleSupplement: 1300000 },
        promotions: "🎄 Giáng sinh & Năm mới - Tặng kèm 1 chai rượu vang.",
        familySuitability: "👨‍👩‍👧‍👦 Lý tưởng cho chuyến đi nghỉ dưỡng cuối năm của gia đình.",
        flightDeals: "✈️ Giá tour chưa bao gồm vé máy bay.",
        notes: "*Giá tour có thể tăng nhẹ vào dịp Lễ, Tết."
      },
      {
        month: "1/2026",
        departureDates: ["10/01/2026", "17/01/2026"],
        prices: { adult: 3990000, child: 1995000, infant: 0, singleSupplement: 1350000 },
        promotions: "🧧 Du xuân nhận lì xì may mắn trị giá 200.000đ.",
        familySuitability: "👨‍👩‍👧‍👦 Cả gia đình cùng nhau du xuân đón Tết.",
        flightDeals: "✈️ Giá tour chưa bao gồm vé máy bay.",
        notes: "*Tour Tết khởi hành theo lịch riêng, vui lòng liên hệ để biết chi tiết."
      },
       {
        month: "2/2026",
        departureDates: ["14/02/2026", "21/02/2026"],
        prices: { adult: 3690000, child: 1845000, infant: 0, singleSupplement: 1250000 },
        promotions: "❤️ Valentine ngọt ngào - Giảm 10% cho các cặp đôi.",
        familySuitability: "👫 Chuyến đi lãng mạn dành cho 2 người.",
        flightDeals: "✈️ Giá tour chưa bao gồm vé máy bay.",
        notes: "*Ưu đãi Valentine áp dụng khi đặt trước ngày 10/02."
      }
    ]
  },
  // Tour 2: Phú Quốc
  {
    id: 2,
    title: "Khám Phá Đảo Ngọc Phú Quốc - Thiên Đường Biển Nhiệt Đới",
    location: "Phú Quốc, Kiên Giang",
    image: "/images/tour-phuquoc.jpg",
    price: "4.250.000",
    duration: "3 ngày 2 đêm",
    rating: 4.9,
    itinerary: [
      "Tham quan Đông đảo: Dinh Cậu, vườn tiêu, nhà thùng nước mắm.",
      "Khám phá Nam đảo: Bãi Sao, nhà tù Phú Quốc, cáp treo Hòn Thơm.",
      "Tự do mua sắm tại chợ đêm Dinh Cậu, khởi hành về lại.",
    ],
    departureMonths: [
      {
        month: "10/2025",
        departureDates: ["15/10/2025", "22/10/2025", "29/10/2025"],
        prices: { adult: 4250000, child: 2125000, infant: 500000, singleSupplement: 1500000 },
        promotions: "🎁 Tặng tour tham quan Grand World miễn phí.",
        familySuitability: "👨‍👩‍👧‍👦 Phù hợp cho mọi lứa tuổi, đặc biệt là gia đình.",
        flightDeals: "✈️ Vietnam Airlines & Vietjet Air có nhiều chuyến bay thẳng.",
        notes: "*Giá tour chưa bao gồm vé vui chơi tại Sun World Hòn Thơm."
      },
      {
        month: "11/2025",
        departureDates: ["10/11/2025", "20/11/2025", "30/11/2025"],
        prices: { adult: 4150000, child: 2075000, infant: 500000, singleSupplement: 1400000 },
        promotions: "☀️ Nắng vàng biển xanh - Giảm 5% khi đặt tour online.",
        familySuitability: "👫 Thích hợp cho các cặp đôi tận hưởng tuần trăng mật.",
        flightDeals: "✈️ Vietjet Air có chương trình giảm giá vé bay đêm.",
        notes: "*Nên mang theo kem chống nắng và đồ bơi."
      },
      {
        month: "12/2025",
        departureDates: ["18/12/2025", "25/12/2025", "28/12/2025"],
        prices: { adult: 4550000, child: 2275000, infant: 500000, singleSupplement: 1600000 },
        promotions: "🎉 Combo Lễ hội cuối năm: Tặng vé xem pháo hoa tại Grand World.",
        familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm không khí lễ hội sôi động cùng gia đình.",
        flightDeals: "✈️ Giá vé máy bay tăng nhẹ, nên đặt sớm để có giá tốt.",
        notes: "*Chương trình pháo hoa có thể thay đổi tùy thuộc vào ban tổ chức."
      },
      {
        month: "1/2026",
        departureDates: ["08/01/2026", "15/01/2026", "22/01/2026"],
        prices: { adult: 4850000, child: 2425000, infant: 500000, singleSupplement: 1700000 },
        promotions: "🎊 Chào năm mới - Nâng hạng khách sạn miễn phí (tùy tình trạng).",
        familySuitability: "👨‍👩‍👧‍👦 Khởi đầu năm mới với kỳ nghỉ đẳng cấp cho cả nhà.",
        flightDeals: "✈️ Bamboo Airways tung nhiều vé ưu đãi sau Tết.",
        notes: "*Giá tour cao điểm dịp Tết Dương lịch."
      },
      {
        month: "2/2026",
        departureDates: ["12/02/2026", "19/02/2026", "26/02/2026"],
        prices: { adult: 4350000, child: 2175000, infant: 500000, singleSupplement: 1550000 },
        promotions: "❤️ Tặng bữa tối lãng mạn trên biển cho cặp đôi.",
        familySuitability: "👫 Điểm đến hoàn hảo cho ngày lễ tình nhân.",
        flightDeals: "✈️ Vietjet Air và Vietnam Airlines có các gói combo vé + khách sạn.",
        notes: "*Ưu đãi Valentine áp dụng cho các cặp đôi đặt tour trước ngày 10/02."
      }
    ]
  },
  // Tour 3: Đà Nẵng
  {
    id: 3,
    title: "Đà Nẵng - Hội An - Bà Nà Hills - Con Đường Di Sản Miền Trung",
    location: "Đà Nẵng, Hội An, Quảng Nam",
    image: "/images/tour-danang.jpg",
    price: "5.100.000",
    duration: "4 ngày 3 đêm",
    rating: 4.9,
    itinerary: [
        "Đón khách tại Đà Nẵng, tham quan bán đảo Sơn Trà, chùa Linh Ứng.",
        "Khám phá Bà Nà Hills, Cầu Vàng, Làng Pháp.",
        "Dạo chơi Phố cổ Hội An về đêm, đi thuyền thả hoa đăng.",
        "Tự do tắm biển Mỹ Khê, mua sắm đặc sản, tiễn sân bay."
    ],
    departureMonths: [
      {
        month: "10/2025",
        departureDates: ["10/10/2025", "24/10/2025"],
        prices: { adult: 5100000, child: 2550000, infant: 500000, singleSupplement: 1800000 },
        promotions: "✨ Tặng voucher show Ký Ức Hội An.",
        familySuitability: "👨‍👩‍👧‍👦 Phù hợp cho gia đình đa thế hệ, nhiều điểm tham quan.",
        flightDeals: "✈️ Nhiều chuyến bay giá rẻ từ Hà Nội và TP.HCM.",
        notes: "*Giá tour đã bao gồm vé cáp treo Bà Nà Hills."
      },
      {
        month: "11/2025",
        departureDates: ["07/11/2025", "21/11/2025"],
        prices: { adult: 4950000, child: 2475000, infant: 500000, singleSupplement: 1700000 },
        promotions: "🍂 Mùa thu lãng mạn - Tặng set trà chiều tại Hội An.",
        familySuitability: "👫 Cặp đôi tận hưởng không khí yên bình của phố cổ.",
        flightDeals: "✈️ Bamboo Airways có nhiều ưu đãi cho đường bay này.",
        notes: "*Thời tiết có thể có mưa nhẹ, nên chuẩn bị ô dù."
      },
      {
        month: "12/2025",
        departureDates: ["12/12/2025", "26/12/2025"],
        prices: { adult: 5300000, child: 2650000, infant: 500000, singleSupplement: 1900000 },
        promotions: "💡 Tham gia Lễ hội đèn lồng Hội An.",
        familySuitability: "👨‍👩‍👧‍👦 Cả gia đình cùng nhau trải nghiệm văn hóa đặc sắc.",
        flightDeals: "✈️ Các hãng bay tăng cường chuyến bay dịp cuối năm.",
        notes: "*Hội An rất đông vào dịp lễ hội."
      },
      {
        month: "1/2026",
        departureDates: ["09/01/2026", "23/01/2026"],
        prices: { adult: 5500000, child: 2750000, infant: 500000, singleSupplement: 2000000 },
        promotions: " Tặng tour ẩm thực đường phố Đà Nẵng.",
        familySuitability: "👨‍👩‍👧‍👦 Khám phá ẩm thực phong phú cùng gia đình.",
        flightDeals: "✈️ Đặt vé sớm để có giá tốt nhất cho dịp Tết.",
        notes: "*Nhiều quán ăn có thể đóng cửa vào dịp Tết Nguyên Đán."
      },
      {
        month: "2/2026",
        departureDates: ["13/02/2026", "27/02/2026"],
        prices: { adult: 5200000, child: 2600000, infant: 500000, singleSupplement: 1850000 },
        promotions: "💖 Giảm 500.000đ cho cặp đôi đặt phòng có view biển.",
        familySuitability: "👫 Kỳ nghỉ lãng mạn tại thành phố biển đáng sống nhất Việt Nam.",
        flightDeals: "✈️ Vietjet Air thường có vé 0đ sau Tết.",
        notes: "*Ưu đãi phòng view biển có giới hạn."
      }
    ]
  },
  // Tour 4: Hà Nội - Hạ Long
  {
    id: 4,
    title: "Hà Nội - Hạ Long - Ninh Bình - Tuyệt Tác Di Sản Phía Bắc",
    location: "Hà Nội, Vịnh Hạ Long, Ninh Bình",
    image: "/images/tour-halong.jpg",
    price: "6.200.000",
    duration: "5 ngày 4 đêm",
    rating: 4.8,
    itinerary: [
        "Tham quan 36 phố phường Hà Nội, Lăng Bác, Hồ Gươm.",
        "Du thuyền Vịnh Hạ Long, tham quan hang Sửng Sốt, chèo kayak.",
        "Ngủ đêm trên du thuyền 5 sao giữa vịnh.",
        "Khám phá Tràng An - Ninh Bình, ngồi thuyền xuyên hang động.",
        "Chinh phục Hang Múa, ngắm toàn cảnh Tam Cốc, trở về Hà Nội."
    ],
    departureMonths: [
      {
        month: "11/2025",
        departureDates: ["05/11/2025", "19/11/2025"],
        prices: { adult: 6200000, child: 3100000, infant: 600000, singleSupplement: 2500000 },
        promotions: "🚢 Nâng hạng phòng du thuyền miễn phí (tùy tình trạng).",
        familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm đa dạng, phù hợp cho người yêu thiên nhiên, lịch sử.",
        flightDeals: "✈️ Vietnam Airlines có nhiều chuyến bay đến sân bay Nội Bài.",
        notes: "*Giá tour bao gồm 1 đêm trên du thuyền Hạ Long."
      },
      {
        month: "12/2025",
        departureDates: ["10/12/2025", "24/12/2025"],
        prices: { adult: 6500000, child: 3250000, infant: 600000, singleSupplement: 2600000 },
        promotions: "❄️ Trải nghiệm không khí Giáng sinh se lạnh của miền Bắc.",
        familySuitability: "👨‍👩‍👧‍👦 Gia đình cùng nhau khám phá di sản thế giới.",
        flightDeals: "✈️ Vietjet Air có khuyến mãi vé bay mùa đông.",
        notes: "*Nên mang theo áo ấm khi đi tour vào tháng 12."
      },
       {
        month: "1/2026",
        departureDates: ["14/01/2026", "28/01/2026"],
        prices: { adult: 6800000, child: 3400000, infant: 600000, singleSupplement: 2700000 },
        promotions: "🌸 Ngắm hoa đào nở sớm tại Ninh Bình.",
        familySuitability: "📸 Dành cho những ai yêu thích vẻ đẹp mùa xuân miền Bắc.",
        flightDeals: "✈️ Giá vé cao điểm Tết, cần đặt trước ít nhất 2 tháng.",
        notes: "*Lịch trình có thể thay đổi tùy thuộc vào thời tiết."
      },
       {
        month: "2/2026",
        departureDates: ["11/02/2026", "25/02/2026"],
        prices: { adult: 6400000, child: 3200000, infant: 600000, singleSupplement: 2550000 },
        promotions: "🙏 Du xuân lễ chùa Bái Đính.",
        familySuitability: "🙏 Phù hợp cho chuyến đi du xuân, cầu an đầu năm.",
        flightDeals: "✈️ Nhiều lựa chọn chuyến bay sau Tết với giá hợp lý.",
        notes: "*Bái Đính rất đông vào dịp đầu năm."
      },
      {
        month: "3/2026",
        departureDates: ["11/03/2026", "25/03/2026"],
        prices: { adult: 6100000, child: 3050000, infant: 600000, singleSupplement: 2450000 },
        promotions: "🌿 Tiết trời mùa xuân mát mẻ, giảm 300.000đ/khách.",
        familySuitability: "👨‍👩‍👧‍👦 Thời tiết đẹp, lý tưởng cho mọi hoạt động tham quan.",
        flightDeals: "✈️ Bamboo Airways thường có khuyến mãi vào tháng 3.",
        notes: "*Thời điểm đẹp nhất trong năm để khám phá miền Bắc."
      }
    ]
  },
  // Tour 5: Đà Lạt
  {
    id: 5,
    title: "Đà Lạt - Thành Phố Ngàn Hoa Mộng Mơ",
    location: "Đà Lạt, Lâm Đồng",
    image: "/images/tour-dalat.jpg",
    price: "2.990.000",
    duration: "3 ngày 2 đêm",
    rating: 4.7,
    itinerary: [
        "Khám phá Thác Datanla, Thiền Viện Trúc Lâm, Hồ Tuyền Lâm.",
        "Check-in tại Quảng trường Lâm Viên, Ga Đà Lạt, Vườn hoa thành phố.",
        "Thưởng thức đặc sản tại chợ đêm Đà Lạt, mua sắm quà lưu niệm."
    ],
    departureMonths: [
      {
        month: "10/2025",
        departureDates: ["11/10/2025", "18/10/2025", "25/10/2025"],
        prices: { adult: 2990000, child: 1495000, infant: 0, singleSupplement: 800000 },
        promotions: "🌸 Tặng vé vào cổng vườn hoa cẩm tú cầu.",
        familySuitability: "👫 Lý tưởng cho các cặp đôi và nhóm bạn trẻ yêu thích không khí lãng mạn.",
        flightDeals: "✈️ Giá tour chưa bao gồm vé máy bay. Sân bay Liên Khương cách trung tâm 30km.",
        notes: "*Đà Lạt về đêm trời se lạnh, nên chuẩn bị áo khoác."
      },
      {
        month: "11/2025",
        departureDates: ["08/11/2025", "15/11/2025", "22/11/2025"],
        prices: { adult: 3100000, child: 1550000, infant: 0, singleSupplement: 850000 },
        promotions: "🌼 Săn mùa hoa dã quỳ vàng rực.",
        familySuitability: "📸 Thiên đường cho những người yêu thích chụp ảnh.",
        flightDeals: "✈️ Các hãng bay thường có khuyến mãi cho chặng bay đến Đà Lạt.",
        notes: "*Hoa dã quỳ đẹp nhất vào buổi sáng."
      },
      {
        month: "12/2025",
        departureDates: ["06/12/2025", "13/12/2025", "27/12/2025"],
        prices: { adult: 3290000, child: 1645000, infant: 0, singleSupplement: 900000 },
        promotions: "🎊 Tham gia Festival Hoa Đà Lạt (dự kiến).",
        familySuitability: "👨‍👩‍👧‍👦 Gia đình hòa mình vào không khí lễ hội hoa lớn nhất trong năm.",
        flightDeals: "✈️ Giá vé máy bay có thể tăng cao, nên đặt trước 1-2 tháng.",
        notes: "*Lịch trình có thể thay đổi để phù hợp với các sự kiện của Festival Hoa."
      },
       {
        month: "1/2026",
        departureDates: ["10/01/2026", "24/01/2026"],
        prices: { adult: 3400000, child: 1700000, infant: 0, singleSupplement: 950000 },
        promotions: "🍓 Tặng tour tham quan và hái dâu tại vườn.",
        familySuitability: "👨‍👩‍👧‍👦 Trẻ em sẽ rất thích thú với trải nghiệm hái dâu.",
        flightDeals: "✈️ Vietjet Air có các chuyến bay đêm giá tốt.",
        notes: "*Nên đặt tour sớm để tránh hết chỗ."
      },
       {
        month: "2/2026",
        departureDates: ["07/02/2026", "21/02/2026"],
        prices: { adult: 3350000, child: 1675000, infant: 0, singleSupplement: 920000 },
        promotions: "☕ Tặng voucher cà phê tại một quán có view đẹp.",
        familySuitability: "👫 Tận hưởng không khí se lạnh đầu xuân.",
        flightDeals: "✈️ Giá vé máy bay ổn định sau Tết, nhiều lựa chọn.",
        notes: "*Đà Lạt có nhiều quán cà phê độc đáo để khám phá."
      }
    ]
  },
  // Tour 6: Sapa
  {
    id: 6,
    title: "Sapa - Chinh Phục Fansipan - Thị Trấn Trong Sương",
    location: "Sapa, Lào Cai",
    image: "/images/tour-sapa.jpg",
    price: "4.500.000",
    duration: "3 ngày 2 đêm",
    rating: 4.8,
    itinerary: [
        "Di chuyển Hà Nội - Sapa bằng xe giường nằm cao cấp.",
        "Chinh phục 'Nóc nhà Đông Dương' bằng cáp treo Fansipan.",
        "Tham quan bản Cát Cát, nhà thờ Đá, chợ Sapa."
    ],
    departureMonths: [
      {
        month: "10/2025",
        departureDates: ["17/10/2025", "31/10/2025"],
        prices: { adult: 4300000, child: 2150000, infant: 500000, singleSupplement: 1400000 },
        promotions: "🌾 Ngắm những thửa ruộng bậc thang cuối mùa vàng óng.",
        familySuitability: "📸 Thiên đường cho nhiếp ảnh gia phong cảnh.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Thời tiết đẹp, mát mẻ, ít mưa."
      },
      {
        month: "11/2025",
        departureDates: ["14/11/2025", "28/11/2025"],
        prices: { adult: 4400000, child: 2200000, infant: 500000, singleSupplement: 1450000 },
        promotions: "☁️ 'Săn mây' tại đỉnh Fansipan.",
        familySuitability: "🏞️ Dành cho những ai yêu thích cảnh quan hùng vĩ.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Cần chuẩn bị quần áo ấm, nhiệt độ bắt đầu giảm."
      },
      {
        month: "12/2025",
        departureDates: ["05/12/2025", "19/12/2025"],
        prices: { adult: 4500000, child: 2250000, infant: 500000, singleSupplement: 1500000 },
        promotions: "🧣 Tặng voucher thuê trang phục dân tộc chụp ảnh.",
        familySuitability: "🏃‍♂️ Phù hợp với du khách trẻ, yêu thích trekking và khám phá.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội. Hỗ trợ đặt vé máy bay đến Nội Bài.",
        notes: "*Khả năng có tuyết rơi vào cuối tháng 12, đầu tháng 1."
      },
       {
        month: "1/2026",
        departureDates: ["09/01/2026", "23/01/2026"],
        prices: { adult: 4800000, child: 2400000, infant: 500000, singleSupplement: 1600000 },
        promotions: "🌸 Ngắm hoa đào, hoa mận nở rộ mùa xuân.",
        familySuitability: "📸 Dành cho những ai yêu thích nhiếp ảnh và vẻ đẹp mùa xuân Tây Bắc.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội. Hỗ trợ đặt vé máy bay đến Nội Bài.",
        notes: "*Nhiệt độ rất thấp, cần chuẩn bị đầy đủ quần áo ấm."
      },
      {
        month: "2/2026",
        departureDates: ["13/02/2026", "27/02/2026"],
        prices: { adult: 4600000, child: 2300000, infant: 500000, singleSupplement: 1550000 },
        promotions: "🎊 Tham gia các lễ hội mùa xuân của người dân tộc thiểu số.",
        familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm văn hóa đặc sắc cùng gia đình.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Không khí lễ hội rất vui và nhộn nhịp."
      }
    ]
  },
  // Tour 7: Quy Nhơn - Phú Yên
  {
    id: 7,
    title: "Quy Nhơn - Phú Yên - Xứ Nẫu Biển Xanh Cát Trắng",
    location: "Quy Nhơn, Bình Định - Phú Yên",
    image: "/images/tour-quynhon.jpg",
    price: "3.800.000",
    duration: "4 ngày 3 đêm",
    rating: 4.7,
    itinerary: [
        "Khám phá Eo Gió, Kỳ Co - 'Maldives của Việt Nam'.",
        "Tham quan Tháp Đôi, Ghềnh Ráng Tiên Sa, mộ Hàn Mặc Tử.",
        "Di chuyển đến Phú Yên, check-in tại Gành Đá Đĩa, Bãi Xép (phim trường 'Tôi thấy hoa vàng trên cỏ xanh').",
        "Tham quan Mũi Điện - cực Đông của Tổ quốc, Tháp Nghinh Phong."
    ],
    departureMonths: [
      {
        month: "11/2025",
        departureDates: ["13/11/2025", "27/11/2025"],
        prices: { adult: 3800000, child: 1900000, infant: 400000, singleSupplement: 1200000 },
        promotions: "🦞 Tặng bữa trưa hải sản tươi sống tại Kỳ Co.",
        familySuitability: "👨‍👩‍👧‍👦 Gia đình yêu thích biển và các hoạt động ngoài trời.",
        flightDeals: "✈️ Sân bay Phù Cát (Quy Nhơn) và Tuy Hòa (Phú Yên) có nhiều chuyến bay.",
        notes: "*Tour yêu cầu thể lực tốt để di chuyển giữa các điểm tham quan."
      },
      {
        month: "12/2025",
        departureDates: ["11/12/2025", "25/12/2025"],
        prices: { adult: 4000000, child: 2000000, infant: 400000, singleSupplement: 1300000 },
        promotions: "📸 Tặng tour chụp ảnh miễn phí tại Bãi Xép.",
        familySuitability: "📸 Dành cho những người đam mê nhiếp ảnh phong cảnh.",
        flightDeals: "✈️ Các hãng bay thường có khuyến mãi vào cuối năm.",
        notes: "*Nên mang theo kính râm và mũ rộng vành."
      },
      {
        month: "1/2026",
        departureDates: ["15/01/2026", "29/01/2026"],
        prices: { adult: 4200000, child: 2100000, infant: 400000, singleSupplement: 1400000 },
        promotions: "🎆 Đón năm mới tại thành phố biển yên bình.",
        familySuitability: "👨‍👩‍👧‍👦 Lựa chọn mới mẻ cho kỳ nghỉ Tết.",
        flightDeals: "✈️ Cần đặt vé máy bay sớm để có giá tốt.",
        notes: "*Thời tiết đẹp, nắng ấm."
      },
      {
        month: "2/2026",
        departureDates: ["12/02/2026", "26/02/2026"],
        prices: { adult: 3900000, child: 1950000, infant: 400000, singleSupplement: 1250000 },
        promotions: "💖 Giảm 5% cho các cặp đôi.",
        familySuitability: "👫 Tận hưởng không gian riêng tư, lãng mạn.",
        flightDeals: "✈️ Nhiều chuyến bay giá rẻ sau dịp Tết.",
        notes: "*Các bãi biển vắng và đẹp."
      },
      {
        month: "3/2026",
        departureDates: ["12/03/2026", "26/03/2026"],
        prices: { adult: 3700000, child: 1850000, infant: 400000, singleSupplement: 1150000 },
        promotions: "☀️ Mùa khô, giảm giá kích cầu du lịch.",
        familySuitability: "👨‍👩‍👧‍👦 Thời điểm lý tưởng để khám phá trọn vẹn vẻ đẹp 'xứ Nẫu'.",
        flightDeals: "✈️ Vietjet Air và Bamboo Airways có nhiều ưu đãi.",
        notes: "*Nắng có thể gắt, cần chuẩn bị đồ chống nắng."
      }
    ]
  },
  // Tour 8: Nha Trang
  {
    id: 8,
    title: "Nha Trang - Hòn Tằm - VinWonders - Vịnh Biển Thiên Đường",
    location: "Nha Trang, Khánh Hòa",
    image: "/images/tour-nhatrang.jpg",
    price: "3.200.000",
    duration: "3 ngày 2 đêm",
    rating: 4.8,
    itinerary: [
        "Tham quan Viện Hải dương học, Chùa Long Sơn, Tháp Bà Ponagar.",
        "Vui chơi không giới hạn tại VinWonders Nha Trang trên đảo Hòn Tre.",
        "Thư giãn và tắm bùn khoáng tại khu du lịch Hòn Tằm."
    ],
    departureMonths: [
      {
        month: "10/2025",
        departureDates: ["09/10/2025", "23/10/2025"],
        prices: { adult: 3200000, child: 1600000, infant: 300000, singleSupplement: 1000000 },
        promotions: "🎢 Tặng voucher ẩm thực trị giá 200.000đ tại VinWonders.",
        familySuitability: "👨‍👩‍👧‍👦 Thiên đường giải trí cho gia đình có trẻ em.",
        flightDeals: "✈️ Sân bay Cam Ranh đón nhiều chuyến bay nội địa và quốc tế.",
        notes: "*Giá tour đã bao gồm vé vào cổng VinWonders và vé tắm bùn Hòn Tằm."
      },
      {
        month: "11/2025",
        departureDates: ["06/11/2025", "20/11/2025"],
        prices: { adult: 3100000, child: 1550000, infant: 300000, singleSupplement: 950000 },
        promotions: "🌊 Giảm giá dịch vụ lặn biển ngắm san hô.",
        familySuitability: "👨‍👩‍👧‍👦 Khám phá thế giới đại dương cùng các bé.",
        flightDeals: "✈️ Nhiều lựa chọn chuyến bay giá rẻ.",
        notes: "*Nên đặt trước dịch vụ lặn biển."
      },
      {
        month: "12/2025",
        departureDates: ["11/12/2025", "25/12/2025"],
        prices: { adult: 3400000, child: 1700000, infant: 300000, singleSupplement: 1100000 },
        promotions: "🎄 Tham gia tiệc buffet Giáng sinh tại khách sạn.",
        familySuitability: "👨‍👩‍👧‍👦 Đón Giáng sinh tại thành phố biển sôi động.",
        flightDeals: "✈️ Cần đặt vé sớm cho dịp cuối năm.",
        notes: "*Chương trình buffet Giáng sinh có phụ thu."
      },
       {
        month: "1/2026",
        departureDates: ["15/01/2026", "29/01/2026"],
        prices: { adult: 3600000, child: 1800000, infant: 300000, singleSupplement: 1200000 },
        promotions: "🎆 Xem pháo hoa mừng năm mới tại quảng trường trung tâm.",
        familySuitability: "👨‍👩‍👧‍👦 Cùng nhau đếm ngược chào năm mới.",
        flightDeals: "✈️ Giá vé máy bay Tết cao, cần lên kế hoạch sớm.",
        notes: "*Khu vực trung tâm rất đông vào đêm giao thừa."
      },
       {
        month: "2/2026",
        departureDates: ["12/02/2026", "26/02/2026"],
        prices: { adult: 3300000, child: 1650000, infant: 300000, singleSupplement: 1050000 },
        promotions: "💖 Trang trí phòng lãng mạn cho các cặp đôi.",
        familySuitability: "👫 Tận hưởng kỳ nghỉ Valentine bên bờ biển.",
        flightDeals: "✈️ Giá vé máy bay sau Tết giảm mạnh.",
        notes: "*Dịch vụ trang trí phòng cần được yêu cầu trước."
      }
    ]
  },
  // Tour 9: Côn Đảo
  {
    id: 9,
    title: "Côn Đảo - Về Miền Đất Thiêng Liêng Hùng Vĩ",
    location: "Côn Đảo, Bà Rịa - Vũng Tàu",
    image: "/images/tour-condao.jpg",
    price: "5.500.000",
    duration: "2 ngày 1 đêm",
    rating: 4.9,
    itinerary: [
        "Viếng Nghĩa trang Hàng Dương, mộ chị Võ Thị Sáu.",
        "Tham quan hệ thống nhà tù Côn Đảo, chùa Núi Một.",
        "Khám phá Bãi Đầm Trầu, lặn ngắm san hô tại Hòn Bảy Cạnh."
    ],
    departureMonths: [
      {
        month: "11/2025",
        departureDates: ["08/11/2025", "22/11/2025"],
        prices: { adult: 5500000, child: 2750000, infant: 1000000, singleSupplement: 2000000 },
        promotions: "🙏 Tặng bộ lễ viếng tại nghĩa trang Hàng Dương.",
        familySuitability: "🙏 Phù hợp cho du lịch tâm linh, không khuyến khích cho trẻ quá nhỏ.",
        flightDeals: "✈️ Giá tour đã bao gồm vé máy bay khứ hồi từ TP.HCM.",
        notes: "*Nên chuẩn bị trang phục lịch sự khi đi viếng."
      },
      {
        month: "12/2025",
        departureDates: ["06/12/2025", "20/12/2025"],
        prices: { adult: 5600000, child: 2800000, infant: 1000000, singleSupplement: 2100000 },
        promotions: "🕊️ Tour kết hợp tham gia lễ cầu siêu.",
        familySuitability: "🙏 Dành cho những người muốn tìm về cội nguồn lịch sử.",
        flightDeals: "✈️ Giá tour đã bao gồm vé máy bay khứ hồi từ TP.HCM.",
        notes: "*Côn Đảo không có nhiều hoạt động giải trí về đêm."
      },
       {
        month: "1/2026",
        departureDates: ["10/01/2026", "24/01/2026"],
        prices: { adult: 5800000, child: 2900000, infant: 1000000, singleSupplement: 2200000 },
        promotions: "✨ Tặng cẩm nang du lịch Côn Đảo.",
        familySuitability: "🙏 Chuyến đi ý nghĩa đầu năm mới.",
        flightDeals: "✈️ Giá tour đã bao gồm vé máy bay khứ hồi từ TP.HCM.",
        notes: "*Nên đặt tour sớm vì vé máy bay ra đảo có hạn."
      },
       {
        month: "2/2026",
        departureDates: ["07/02/2026", "21/02/2026"],
        prices: { adult: 5700000, child: 2850000, infant: 1000000, singleSupplement: 2150000 },
        promotions: "🐢 Tìm hiểu về công tác bảo tồn rùa biển.",
        familySuitability: "👨‍👩‍👧‍👦 Giáo dục cho trẻ em về lịch sử và thiên nhiên.",
        flightDeals: "✈️ Giá tour đã bao gồm vé máy bay khứ hồi từ TP.HCM.",
        notes: "*Mùa rùa đẻ trứng thường vào các tháng mùa hè."
      },
      {
        month: "3/2026",
        departureDates: ["07/03/2026", "21/03/2026"],
        prices: { adult: 5400000, child: 2700000, infant: 1000000, singleSupplement: 1950000 },
        promotions: "☀️ Mùa khô, biển lặng, giảm 200.000đ/khách.",
        familySuitability: "👨‍👩‍👧‍👦 Thời tiết đẹp, thuận lợi cho việc tham quan và đi lại.",
        flightDeals: "✈️ Giá tour đã bao gồm vé máy bay khứ hồi từ TP.HCM.",
        notes: "*Thời điểm tốt nhất để lặn ngắm san hô."
      }
    ]
  },
  // Tour 10: Hà Giang
  {
    id: 10,
    title: "Hà Giang - Cung Đường Hạnh Phúc - Mùa Hoa Tam Giác Mạch",
    location: "Hà Giang",
    image: "/images/tour-hagiang.jpg",
    price: "3.900.000",
    duration: "4 ngày 3 đêm",
    rating: 4.9,
    itinerary: [
        "Chinh phục Cột cờ Lũng Cú, điểm cực Bắc của Tổ quốc.",
        "Đi thuyền trên sông Nho Quế, ngắm hẻm Tu Sản hùng vĩ.",
        "Check-in tại Dinh thự họ Vương, Phố cổ Đồng Văn.",
        "Ngắm hoa tam giác mạch trên các sườn đồi (tháng 10, 11)."
    ],
    departureMonths: [
      {
        month: "10/2025",
        departureDates: ["17/10/2025", "31/10/2025"],
        prices: { adult: 3900000, child: 1950000, infant: 400000, singleSupplement: 1000000 },
        promotions: "🌸 Tặng tour chụp ảnh giữa cánh đồng hoa tam giác mạch.",
        familySuitability: "🏞️ Dành cho người trẻ yêu thích mạo hiểm và cảnh quan thiên nhiên.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội. Hỗ trợ đặt vé máy bay.",
        notes: "*Yêu cầu sức khỏe tốt, tour di chuyển nhiều bằng ô tô trên đường đèo."
      },
      {
        month: "11/2025",
        departureDates: ["07/11/2025", "21/11/2025"],
        prices: { adult: 4000000, child: 2000000, infant: 400000, singleSupplement: 1100000 },
        promotions: "📸 Cuối mùa hoa, giảm 100.000đ/khách.",
        familySuitability: "🏞️ Vẫn còn những cánh đồng hoa nở muộn tuyệt đẹp.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Thời tiết bắt đầu lạnh hơn."
      },
      {
        month: "12/2025",
        departureDates: ["05/12/2025", "19/12/2025"],
        prices: { adult: 3800000, child: 1900000, infant: 400000, singleSupplement: 950000 },
        promotions: "🌼 Ngắm mùa hoa cải vàng.",
        familySuitability: "🏞️ Cảnh sắc hùng vĩ của cao nguyên đá mùa đông.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Rất lạnh, cần chuẩn bị quần áo chống rét."
      },
      {
        month: "1/2026",
        departureDates: ["16/01/2026", "30/01/2026"],
        prices: { adult: 4200000, child: 2100000, infant: 400000, singleSupplement: 1200000 },
        promotions: "🌸 Săn hoa đào, hoa mận nở sớm.",
        familySuitability: "📸 Vẻ đẹp tinh khôi của mùa xuân trên cao nguyên đá.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Cần theo dõi thông tin thời tiết để có chuyến đi trọn vẹn."
      },
      {
        month: "2/2026",
        departureDates: ["13/02/2026", "27/02/2026"],
        prices: { adult: 4100000, child: 2050000, infant: 400000, singleSupplement: 1150000 },
        promotions: "🎊 Tham gia các lễ hội đầu xuân của người Mông.",
        familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm không khí Tết vùng cao.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Có cơ hội thưởng thức các món ăn đặc trưng ngày Tết."
      }
    ]
  },
  // Tour 11: Huế
  {
    id: 11,
    title: "Huế - Kinh Thành Cổ Kính - Vẻ Đẹp Dòng Sông Hương",
    location: "Huế",
    image: "/images/tour-hue.jpg",
    price: "2.800.000",
    duration: "3 ngày 2 đêm",
    rating: 4.6,
    itinerary: [
        "Tham quan Đại Nội Huế, lăng Khải Định, lăng Minh Mạng.",
        "Đi thuyền rồng trên sông Hương, nghe ca Huế.",
        "Viếng Chùa Thiên Mụ, tham quan Làng hương Thủy Xuân."
    ],
    departureMonths: [
      {
        month: "10/2025",
        departureDates: ["10/10/2025", "24/10/2025"],
        prices: { adult: 2700000, child: 1350000, infant: 300000, singleSupplement: 850000 },
        promotions: "🍂 Mùa thu dịu dàng, tặng set trà và bánh cung đình.",
        familySuitability: "👫 Thích hợp cho những ai yêu thích sự yên tĩnh, cổ kính.",
        flightDeals: "✈️ Sân bay Phú Bài (Huế) cách trung tâm thành phố 15km.",
        notes: "*Thời tiết mát mẻ, dễ chịu."
      },
      {
        month: "11/2025",
        departureDates: ["07/11/2025", "21/11/2025"],
        prices: { adult: 2650000, child: 1325000, infant: 300000, singleSupplement: 800000 },
        promotions: "🌧️ Mùa mưa, giảm giá tour 10%.",
        familySuitability: "📚 Dành cho những ai muốn khám phá văn hóa, lịch sử sâu sắc.",
        flightDeals: "✈️ Các hãng bay thường có vé giá rẻ vào mùa này.",
        notes: "*Cần chuẩn bị ô dù, áo mưa."
      },
      {
        month: "12/2025",
        departureDates: ["04/12/2025", "18/12/2025"],
        prices: { adult: 2800000, child: 1400000, infant: 300000, singleSupplement: 900000 },
        promotions: "👑 Tặng dịch vụ thuê áo dài, nón lá chụp ảnh tại Đại Nội.",
        familySuitability: "👨‍👩‍👧‍👦 Phù hợp với gia đình yêu thích lịch sử và văn hóa.",
        flightDeals: "✈️ Sân bay Phú Bài (Huế) cách trung tâm thành phố 15km.",
        notes: "*Nên thưởng thức các món đặc sản Huế như bún bò, bánh bèo, bánh lọc."
      },
      {
        month: "1/2026",
        departureDates: ["08/01/2026", "22/01/2026"],
        prices: { adult: 3000000, child: 1500000, infant: 300000, singleSupplement: 1000000 },
        promotions: "✨ Tặng tour tham quan làng nghề làm mứt gừng.",
        familySuitability: "👨‍👩‍👧‍👦 Tìm hiểu về không khí chuẩn bị Tết của người dân xứ Huế.",
        flightDeals: "✈️ Cần đặt vé sớm cho dịp Tết.",
        notes: "*Có cơ hội mua các loại mứt Tết đặc sản."
      },
      {
        month: "2/2026",
        departureDates: ["12/02/2026", "26/02/2026"],
        prices: { adult: 2900000, child: 1450000, infant: 300000, singleSupplement: 950000 },
        promotions: "🙏 Du xuân, viếng chùa cầu an.",
        familySuitability: "🙏 Chuyến đi tâm linh đầu năm mới.",
        flightDeals: "✈️ Nhiều chuyến bay giá rẻ sau Tết.",
        notes: "*Không khí yên bình, trang nghiêm."
      }
    ]
  },
  // Tour 12: Miền Tây
  {
    id: 12,
    title: "Miền Tây - Mỹ Tho - Bến Tre - Cần Thơ - Trải Nghiệm Sông Nước",
    location: "Mỹ Tho, Bến Tre, Cần Thơ",
    image: "/images/tour-mientay.jpg",
    price: "2.500.000",
    duration: "2 ngày 1 đêm",
    rating: 4.5,
    itinerary: [
        "Đi thuyền trên sông Tiền, tham quan 4 cồn Long, Lân, Quy, Phụng.",
        "Nghe đờn ca tài tử, thưởng thức trái cây tại vườn, uống trà mật ong.",
        "Trải nghiệm đi xuồng ba lá, tham quan lò kẹo dừa.",
        "Tham quan Chợ nổi Cái Răng (Cần Thơ) vào sáng sớm."
    ],
    departureMonths: [
      {
        month: "11/2025",
        departureDates: ["01/11/2025", "15/11/2025", "29/11/2025"],
        prices: { adult: 2500000, child: 1250000, infant: 0, singleSupplement: 700000 },
        promotions: "🥥 Tặng 1 hộp kẹo dừa Bến Tre chính hiệu.",
        familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm văn hóa sông nước đặc sắc, phù hợp mọi lứa tuổi.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Nên đi chợ nổi vào sáng sớm để cảm nhận hết sự nhộn nhịp."
      },
      {
        month: "12/2025",
        departureDates: ["06/12/2025", "20/12/2025"],
        prices: { adult: 2600000, child: 1300000, infant: 0, singleSupplement: 750000 },
        promotions: "🍊 Mùa quýt hồng Lai Vung.",
        familySuitability: "👨‍👩‍👧‍👦 Cả gia đình cùng nhau tham quan vườn quýt.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Có thể mua quýt tại vườn làm quà."
      },
      {
        month: "1/2026",
        departureDates: ["10/01/2026", "24/01/2026"],
        prices: { adult: 2800000, child: 1400000, infant: 0, singleSupplement: 800000 },
        promotions: "🌸 Tham quan các làng hoa Tết như Sa Đéc, Cái Mơn.",
        familySuitability: "📸 Dành cho những ai yêu thích chụp ảnh hoa Tết.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Không khí Tết rộn ràng khắp miền sông nước."
      },
      {
        month: "2/2026",
        departureDates: ["07/02/2026", "21/02/2026"],
        prices: { adult: 2700000, child: 1350000, infant: 0, singleSupplement: 780000 },
        promotions: "🙏 Du xuân viếng Miếu Bà Chúa Xứ Châu Đốc (tour kết hợp).",
        familySuitability: "🙏 Chuyến đi tâm linh đầu năm.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Tour kết hợp có thể kéo dài thêm 1 ngày."
      },
       {
        month: "3/2026",
        departureDates: ["07/03/2026", "21/03/2026"],
        prices: { adult: 2400000, child: 1200000, infant: 0, singleSupplement: 650000 },
        promotions: "☀️ Mùa khô, giảm giá tour 5%.",
        familySuitability: "👨‍👩‍👧‍👦 Thời tiết thuận lợi cho các hoạt động tham quan.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Ít mưa, dễ dàng di chuyển."
      }
    ]
  },
  // Tour 13: Cát Bà
  {
    id: 13,
    title: "Hải Phòng - Cát Bà - Vịnh Lan Hạ - Hòn Đảo Ngọc Miền Bắc",
    location: "Cát Bà, Hải Phòng",
    image: "/images/tour-catba.jpg",
    price: "3.100.000",
    duration: "3 ngày 2 đêm",
    rating: 4.6,
    itinerary: [
        "Di chuyển Hà Nội - Hải Phòng - Cát Bà bằng xe và phà/cáp treo.",
        "Tắm biển tại các bãi Cát Cò 1, 2, 3.",
        "Du thuyền khám phá Vịnh Lan Hạ, làng chài Cái Bèo.",
        "Trekking Vườn Quốc gia Cát Bà, tham quan Pháo đài Thần công."
    ],
    departureMonths: [
      {
        month: "4/2026",
        departureDates: ["11/04/2026", "25/04/2026"],
        prices: { adult: 3100000, child: 1550000, infant: 300000, singleSupplement: 1000000 },
        promotions: "☀️ Bắt đầu mùa du lịch biển, giảm giá cho khách đặt sớm.",
        familySuitability: "👨‍👩‍👧‍👦 Tránh đông đúc trước kỳ nghỉ lễ 30/4.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Thời tiết ấm dần, thích hợp để tắm biển."
      },
      {
        month: "5/2026",
        departureDates: ["09/05/2026", "23/05/2026"],
        prices: { adult: 3300000, child: 1650000, infant: 300000, singleSupplement: 1100000 },
        promotions: "🚣 Tặng tour chèo thuyền kayak miễn phí tại Vịnh Lan Hạ.",
        familySuitability: "👨‍👩‍👧‍👦 Gia đình có thể tận hưởng kỳ nghỉ biển yên bình.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Nên đặt tour sớm vào cuối tuần vì Cát Bà khá đông khách."
      },
      {
        month: "6/2026",
        departureDates: ["06/06/2026", "20/06/2026"],
        prices: { adult: 3500000, child: 1750000, infant: 300000, singleSupplement: 1200000 },
        promotions: "🏖️ Combo gia đình, giảm 10% cho trẻ em.",
        familySuitability: "👨‍👩‍👧‍👦 Kỳ nghỉ hè lý tưởng cho các bé.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Cao điểm du lịch, cần đặt phòng khách sạn trước."
      },
       {
        month: "7/2026",
        departureDates: ["04/07/2026", "18/07/2026"],
        prices: { adult: 3600000, child: 1800000, infant: 300000, singleSupplement: 1250000 },
        promotions: "🦑 Tặng tour câu mực đêm trên vịnh.",
        familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm thú vị cho cả gia đình.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Thời tiết nóng, cần chuẩn bị đồ chống nắng."
      },
      {
        month: "8/2026",
        departureDates: ["08/08/2026", "22/08/2026"],
        prices: { adult: 3400000, child: 1700000, infant: 300000, singleSupplement: 1150000 },
        promotions: "✨ Cuối hè, giảm giá tour 200.000đ/khách.",
        familySuitability: "👨‍👩‍👧‍👦 Tận hưởng những ngày hè cuối cùng trước khi vào năm học mới.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Có thể có bão vào cuối tháng 8."
      }
    ]
  },
  // Tour 14: Mai Châu - Pù Luông
  {
    id: 14,
    title: "Mai Châu - Pù Luông - Về Chốn Bình Yên Giữa Núi Rừng",
    location: "Mai Châu, Hòa Bình - Pù Luông, Thanh Hóa",
    image: "/images/tour-puluong.jpg",
    price: "2.900.000",
    duration: "3 ngày 2 đêm",
    rating: 4.8,
    itinerary: [
        "Khám phá thung lũng Mai Châu, đạp xe qua bản Lác, bản Poom Cọong.",
        "Nghỉ tại homestay nhà sàn, thưởng thức văn nghệ và rượu cần.",
        "Trekking tại Khu bảo tồn thiên nhiên Pù Luông, ngắm ruộng bậc thang.",
        "Check-in tại guồng nước và thác Hiêu."
    ],
    departureMonths: [
      {
        month: "10/2025",
        departureDates: ["11/10/2025", "25/10/2025"],
        prices: { adult: 2900000, child: 1450000, infant: 0, singleSupplement: 800000 },
        promotions: "🌾 Mùa lúa chín vàng - Tặng voucher ẩm thực đặc sản núi rừng.",
        familySuitability: "🏞️ Dành cho những ai muốn 'trốn phố về quê', tận hưởng không khí trong lành.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội bằng xe Limousine.",
        notes: "*Nên mang giày thể thao để tiện trekking."
      },
      {
        month: "11/2025",
        departureDates: ["08/11/2025", "22/11/2025"],
        prices: { adult: 2800000, child: 1400000, infant: 0, singleSupplement: 750000 },
        promotions: "🍂 Tiết trời thu mát mẻ, giảm giá 5%.",
        familySuitability: "👫 Thích hợp cho các cặp đôi tìm kiếm sự yên bình.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Thời tiết đẹp nhất trong năm."
      },
      {
        month: "12/2025",
        departureDates: ["13/12/2025", "27/12/2025"],
        prices: { adult: 2850000, child: 1425000, infant: 0, singleSupplement: 780000 },
        promotions: "🔥 Đốt lửa trại và giao lưu văn nghệ.",
        familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm ấm cúng bên gia đình và bạn bè.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Cần mang theo áo ấm."
      },
      {
        month: "1/2026",
        departureDates: ["10/01/2026", "24/01/2026"],
        prices: { adult: 3000000, child: 1500000, infant: 0, singleSupplement: 850000 },
        promotions: "🌸 Ngắm hoa mận, hoa đào nở trắng sườn đồi.",
        familySuitability: "📸 Dành cho những ai yêu thích vẻ đẹp mùa xuân.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Thời gian hoa nở có thể thay đổi tùy thuộc vào thời tiết."
      },
      {
        month: "2/2026",
        departureDates: ["14/02/2026", "28/02/2026"],
        prices: { adult: 2950000, child: 1475000, infant: 0, singleSupplement: 820000 },
        promotions: "🎊 Tham gia các lễ hội đầu năm của người Thái.",
        familySuitability: "👨‍👩‍👧‍👦 Khám phá văn hóa bản địa đặc sắc.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Có cơ hội tham gia các trò chơi dân gian."
      }
    ]
  },
  // Tour 15: Phong Nha - Kẻ Bàng
  {
    id: 15,
    title: "Phong Nha - Kẻ Bàng - Khám Phá Vương Quốc Hang Động",
    location: "Phong Nha, Quảng Bình",
    image: "/images/tour-phongnha.jpg",
    price: "4.200.000",
    duration: "3 ngày 2 đêm",
    rating: 4.9,
    itinerary: [
        "Tham quan Động Phong Nha - ngồi thuyền đi vào trong động.",
        "Khám phá Động Thiên Đường - 'hoàng cung trong lòng đất'.",
        "Trải nghiệm Zipline và tắm bùn tại Sông Chày - Hang Tối."
    ],
    departureMonths: [
      {
        month: "12/2025",
        departureDates: ["06/12/2025", "20/12/2025"],
        prices: { adult: 4200000, child: 2100000, infant: 400000, singleSupplement: 1400000 },
        promotions: "🏞️ Giảm 5% cho sinh viên.",
        familySuitability: "🧗‍♂️ Phù hợp với du khách yêu thích khám phá, mạo hiểm.",
        flightDeals: "✈️ Sân bay Đồng Hới cách Phong Nha khoảng 45km.",
        notes: "*Các hoạt động tại Sông Chày - Hang Tối yêu cầu thể lực tốt."
      },
      {
        month: "1/2026",
        departureDates: ["10/01/2026", "24/01/2026"],
        prices: { adult: 4400000, child: 2200000, infant: 400000, singleSupplement: 1500000 },
        promotions: "✨ Tặng đèn pin đội đầu chuyên dụng.",
        familySuitability: "🧗‍♂️ Chuyến đi đầu năm đầy hứng khởi.",
        flightDeals: "✈️ Cần đặt vé sớm cho dịp Tết.",
        notes: "*Nhiệt độ trong hang động luôn mát mẻ."
      },
      {
        month: "2/2026",
        departureDates: ["14/02/2026", "28/02/2026"],
        prices: { adult: 4300000, child: 2150000, infant: 400000, singleSupplement: 1450000 },
        promotions: "💖 Giảm 10% cho cặp đôi.",
        familySuitability: "👫 Cùng nhau khám phá những kỳ quan của tạo hóa.",
        flightDeals: "✈️ Nhiều chuyến bay giá rẻ sau Tết.",
        notes: "*Một số hoạt động có thể không phù hợp với người sợ độ cao."
      },
      {
        month: "3/2026",
        departureDates: ["14/03/2026", "28/03/2026"],
        prices: { adult: 4100000, child: 2050000, infant: 400000, singleSupplement: 1350000 },
        promotions: "☀️ Mùa khô, giảm giá tour 200.000đ/khách.",
        familySuitability: "👨‍👩‍👧‍👦 Thời tiết thuận lợi cho tất cả các hoạt động.",
        flightDeals: "✈️ Vietjet Air và Bamboo Airways có nhiều ưu đãi.",
        notes: "*Nên mang theo đồ bơi để tham gia các hoạt động dưới nước."
      },
      {
        month: "4/2026",
        departureDates: ["11/04/2026", "25/04/2026"],
        prices: { adult: 4500000, child: 2250000, infant: 400000, singleSupplement: 1600000 },
        promotions: "🎉 Combo nghỉ lễ 30/4, tặng bữa tối BBQ.",
        familySuitability: "👨‍👩‍👧‍👦 Kỳ nghỉ lễ đáng nhớ cho cả gia đình.",
        flightDeals: "✈️ Giá vé máy bay cao điểm, cần đặt trước ít nhất 2 tháng.",
        notes: "*Phong Nha rất đông vào dịp lễ."
      }
    ]
  },
  // Tour 16: Lý Sơn
  {
    id: 16,
    title: "Đảo Lý Sơn - 'Vương quốc tỏi' Giữa Biển Khơi",
    location: "Đảo Lý Sơn, Quảng Ngãi",
    image: "/images/tour-lyson.jpg",
    price: "3.500.000",
    duration: "2 ngày 1 đêm",
    rating: 4.6,
    itinerary: [
        "Di chuyển bằng tàu cao tốc ra đảo lớn.",
        "Tham quan Chùa Hang, Cổng Tò Vò, đỉnh Thới Lới.",
        "Đi cano ra Đảo Bé, tự do tắm biển, lặn ngắm san hô."
    ],
    departureMonths: [
      {
        month: "11/2025",
        departureDates: ["14/11/2025", "28/11/2025"],
        prices: { adult: 3500000, child: 1750000, infant: 350000, singleSupplement: 1100000 },
        promotions: "🧄 Tặng 1kg tỏi Lý Sơn làm quà.",
        familySuitability: "👨‍👩‍👧‍👦 Phù hợp với gia đình muốn trải nghiệm cuộc sống biển đảo hoang sơ.",
        flightDeals: "✈️ Bay đến sân bay Chu Lai (Quảng Nam), sau đó di chuyển bằng ô tô đến cảng Sa Kỳ.",
        notes: "*Biển có thể động vào mùa mưa, lịch tàu có thể thay đổi."
      },
      {
        month: "12/2025",
        departureDates: ["12/12/2025", "26/12/2025"],
        prices: { adult: 3600000, child: 1800000, infant: 350000, singleSupplement: 1150000 },
        promotions: "✨ Tặng tour ngắm hoàng hôn trên đỉnh Thới Lới.",
        familySuitability: "📸 Dành cho những ai yêu thích vẻ đẹp bình minh và hoàng hôn trên biển.",
        flightDeals: "✈️ Cần theo dõi lịch tàu cao tốc.",
        notes: "*Mùa này ít khách du lịch, không gian yên tĩnh."
      },
      {
        month: "1/2026",
        departureDates: ["16/01/2026", "30/01/2026"],
        prices: { adult: 3800000, child: 1900000, infant: 350000, singleSupplement: 1200000 },
        promotions: "🌿 Mùa trồng tỏi, tìm hiểu về quy trình trồng tỏi Lý Sơn.",
        familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm độc đáo cho cả gia đình.",
        flightDeals: "✈️ Nên kết hợp tham quan các điểm khác tại Quảng Ngãi.",
        notes: "*Có cơ hội thưởng thức gỏi tỏi, đặc sản của đảo."
      },
      {
        month: "2/2026",
        departureDates: ["13/02/2026", "27/02/2026"],
        prices: { adult: 3700000, child: 1850000, infant: 350000, singleSupplement: 1180000 },
        promotions: "💖 Tặng bữa tối hải sản cho các cặp đôi.",
        familySuitability: "👫 Không gian lãng mạn, hoang sơ.",
        flightDeals: "✈️ Nhiều chuyến bay giá rẻ sau Tết đến sân bay Chu Lai.",
        notes: "*Nên đặt phòng homestay có view biển."
      },
      {
        month: "3/2026",
        departureDates: ["13/03/2026", "27/03/2026"],
        prices: { adult: 3400000, child: 1700000, infant: 350000, singleSupplement: 1050000 },
        promotions: "☀️ Mùa khô, giảm 150.000đ/khách.",
        familySuitability: "👨‍👩‍👧‍👦 Thời tiết đẹp, biển trong xanh, thích hợp để lặn biển.",
        flightDeals: "✈️ Giá vé máy bay ổn định.",
        notes: "*Đảo Bé là nơi lặn ngắm san hô đẹp nhất."
      }
    ]
  },
  // Tour 17: Vũng Tàu
  {
    id: 17,
    title: "Vũng Tàu - Kỳ Nghỉ Cuối Tuần Tại Thành Phố Biển",
    location: "Vũng Tàu",
    image: "/images/tour-vungtau.jpg",
    price: "1.500.000",
    duration: "2 ngày 1 đêm",
    rating: 4.4,
    itinerary: [
        "Tắm biển tại Bãi Sau, tham quan Tượng Chúa Kitô Vua.",
        "Check-in tại ngọn hải đăng Vũng Tàu, Mũi Nghinh Phong.",
        "Thưởng thức hải sản tươi sống và bánh khọt."
    ],
    departureMonths: [
      {
        month: "10/2025",
        departureDates: ["Mỗi cuối tuần"],
        prices: { adult: 1500000, child: 750000, infant: 0, singleSupplement: 500000 },
        promotions: "☀️ Giảm 10% khi đặt tour vào ngày trong tuần.",
        familySuitability: "👨‍👩‍👧‍👦 Lựa chọn hàng đầu cho chuyến đi ngắn ngày của gia đình từ TP.HCM.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Vũng Tàu rất đông vào các ngày lễ và cuối tuần."
      },
      {
        month: "11/2025",
        departureDates: ["Mỗi cuối tuần"],
        prices: { adult: 1450000, child: 725000, infant: 0, singleSupplement: 480000 },
        promotions: "🦑 Tặng voucher ăn bánh khọt.",
        familySuitability: "👨‍👩‍👧‍👦 Đổi gió cuối tuần cho cả gia đình.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Có thể đặt tour riêng cho nhóm."
      },
      {
        month: "12/2025",
        departureDates: ["Mỗi cuối tuần"],
        prices: { adult: 1600000, child: 800000, infant: 0, singleSupplement: 550000 },
        promotions: "🎄 Không khí Giáng sinh tại các nhà thờ lớn.",
        familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm Giáng sinh ở thành phố biển.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Nên đặt sớm cho dịp cuối năm."
      },
      {
        month: "1/2026",
        departureDates: ["Mỗi cuối tuần"],
        prices: { adult: 1700000, child: 850000, infant: 0, singleSupplement: 600000 },
        promotions: "🎆 Đón năm mới, xem pháo hoa trên biển.",
        familySuitability: "👨‍👩‍👧‍👦 Cùng nhau chào đón năm mới.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Giá tour cao điểm dịp Tết Dương lịch."
      },
      {
        month: "2/2026",
        departureDates: ["Mỗi cuối tuần"],
        prices: { adult: 1550000, child: 775000, infant: 0, singleSupplement: 520000 },
        promotions: "💖 Giảm 5% cho các cặp đôi.",
        familySuitability: "👫 Chuyến đi ngắn ngày lãng mạn.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Nhiều lựa chọn khách sạn, resort đẹp."
      }
    ]
  },
  // Tour 18: Tây Nguyên
  {
    id: 18,
    title: "Tây Nguyên - Buôn Ma Thuột - Tiếng Gọi Đại Ngàn",
    location: "Buôn Ma Thuột, Đắk Lắk",
    image: "/images/tour-taynguyen.jpg",
    price: "3.200.000",
    duration: "3 ngày 2 đêm",
    rating: 4.7,
    itinerary: [
        "Tham quan Làng cà phê Trung Nguyên, Bảo tàng Thế giới Cà phê.",
        "Khám phá cụm thác Dray Nur, Dray Sáp.",
        "Trải nghiệm cưỡi voi, đi thuyền độc mộc tại Hồ Lắk."
    ],
    departureMonths: [
      {
        month: "11/2025",
        departureDates: ["14/11/2025", "28/11/2025"],
        prices: { adult: 3200000, child: 1600000, infant: 300000, singleSupplement: 900000 },
        promotions: "☕ Tặng 1 ly cà phê chồn.",
        familySuitability: "👨‍👩‍👧‍👦 Phù hợp với gia đình yêu thích thiên nhiên và văn hóa.",
        flightDeals: "✈️ Sân bay Buôn Ma Thuột có nhiều chuyến bay từ các thành phố lớn.",
        notes: "*Nên thử các món đặc sản như gà nướng cơm lam."
      },
      {
        month: "12/2025",
        departureDates: ["12/12/2025", "26/12/2025"],
        prices: { adult: 3300000, child: 1650000, infant: 300000, singleSupplement: 950000 },
        promotions: "🌼 Mùa hoa dã quỳ nở vàng rực.",
        familySuitability: "📸 Thiên đường cho những người yêu thích chụp ảnh.",
        flightDeals: "✈️ Vietjet Air thường có vé giá rẻ.",
        notes: "*Hoa dã quỳ đẹp nhất vào buổi sáng."
      },
       {
        month: "1/2026",
        departureDates: ["16/01/2026", "30/01/2026"],
        prices: { adult: 3500000, child: 1750000, infant: 300000, singleSupplement: 1000000 },
        promotions: "🎊 Tham gia các lễ hội mừng năm mới của đồng bào Ê Đê.",
        familySuitability: "👨‍👩‍👧‍👦 Tìm hiểu văn hóa cồng chiêng Tây Nguyên.",
        flightDeals: "✈️ Cần đặt vé sớm cho dịp Tết.",
        notes: "*Có cơ hội tham gia Lễ hội Cà phê Buôn Ma Thuột (thường tổ chức 2 năm 1 lần)."
      },
       {
        month: "2/2026",
        departureDates: ["13/02/2026", "27/02/2026"],
        prices: { adult: 3400000, child: 1700000, infant: 300000, singleSupplement: 980000 },
        promotions: "🐘 Tặng voucher giảm giá trải nghiệm cưỡi voi.",
        familySuitability: "👨‍👩‍👧‍👦 Trẻ em sẽ rất thích thú khi được gặp những chú voi.",
        flightDeals: "✈️ Giá vé máy bay sau Tết hợp lý.",
        notes: "*Nên chọn các khu du lịch có hoạt động cưỡi voi nhân đạo."
      },
       {
        month: "3/2026",
        departureDates: ["13/03/2026", "27/03/2026"],
        prices: { adult: 3100000, child: 1550000, infant: 300000, singleSupplement: 850000 },
        promotions: "☕ Mùa hoa cà phê nở trắng trời.",
        familySuitability: "📸 Cảnh tượng tuyệt đẹp cho những người yêu nhiếp ảnh.",
        flightDeals: "✈️ Bamboo Airways có nhiều ưu đãi.",
        notes: "*Hoa cà phê có hương thơm rất dễ chịu."
      }
    ]
  },
  // Tour 19: Mộc Châu
  {
    id: 19,
    title: "Mộc Châu - Thảo Nguyên Xanh Mướt Mùa Mận Chín",
    location: "Mộc Châu, Sơn La",
    image: "/images/tour-mocchau.jpg",
    price: "2.500.000",
    duration: "2 ngày 1 đêm",
    rating: 4.7,
    itinerary: [
        "Check-in tại đồi chè trái tim, thác Dải Yếm.",
        "Tham quan rừng thông Bản Áng.",
        "Khám phá thung lũng mận Nà Ka, tự tay hái mận (vào mùa)."
    ],
    departureMonths: [
      {
        month: "11/2025",
        departureDates: ["08/11/2025", "22/11/2025"],
        prices: { adult: 2500000, child: 1250000, infant: 0, singleSupplement: 700000 },
        promotions: "🌼 Mùa hoa cải trắng, hoa dã quỳ.",
        familySuitability: "📸 Thiên đường 'sống ảo' cho giới trẻ.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Nên thuê xe máy để tiện di chuyển giữa các điểm tham quan."
      },
      {
        month: "12/2025",
        departureDates: ["13/12/2025", "27/12/2025"],
        prices: { adult: 2600000, child: 1300000, infant: 0, singleSupplement: 750000 },
        promotions: "🍓 Tham quan và hái dâu tây tại các nông trại.",
        familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm thú vị cho trẻ em.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Thời tiết rất lạnh, cần chuẩn bị quần áo ấm."
      },
      {
        month: "1/2026",
        departureDates: ["17/01/2026", "31/01/2026"],
        prices: { adult: 2800000, child: 1400000, infant: 0, singleSupplement: 800000 },
        promotions: "🌸 Mùa hoa đào, hoa mận nở rộ.",
        familySuitability: "📸 Cảnh sắc mùa xuân đẹp như tranh vẽ.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Đây là mùa đẹp nhất trong năm của Mộc Châu."
      },
      {
        month: "2/2026",
        departureDates: ["14/02/2026", "28/02/2026"],
        prices: { adult: 2700000, child: 1350000, infant: 0, singleSupplement: 780000 },
        promotions: "💖 Tặng một hộp mứt mận Mộc Châu.",
        familySuitability: "👫 Điểm đến lãng mạn cho các cặp đôi.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Hoa vẫn còn nở đẹp vào đầu tháng."
      },
      {
        month: "3/2026",
        departureDates: ["14/03/2026", "28/03/2026"],
        prices: { adult: 2400000, child: 1200000, infant: 0, singleSupplement: 650000 },
        promotions: "🌿 Mùa hoa ban nở trắng núi rừng.",
        familySuitability: "🏞️ Tận hưởng không khí trong lành, mát mẻ.",
        flightDeals: "✈️ Tour khởi hành từ Hà Nội.",
        notes: "*Thời tiết dễ chịu, thích hợp cho các hoạt động ngoài trời."
      }
    ]
  },
  // Tour 20: Cần Thơ - Châu Đốc
  {
    id: 20,
    title: "Cần Thơ - Châu Đốc - Hành Trình Về Miền Tây Tâm Linh",
    location: "Cần Thơ, An Giang",
    image: "/images/tour-chaudoc.jpg",
    price: "2.800.000",
    duration: "3 ngày 2 đêm",
    rating: 4.6,
    itinerary: [
        "Tham quan Chợ nổi Cái Răng, Thiền viện Trúc Lâm Phương Nam (Cần Thơ).",
        "Di chuyển đến Châu Đốc, viếng Miếu Bà Chúa Xứ Núi Sam, Lăng Thoại Ngọc Hầu.",
        "Khám phá Rừng tràm Trà Sư, đi xuồng len lỏi giữa rừng tràm.",
        "Mua sắm đặc sản mắm tại chợ Châu Đốc."
    ],
    departureMonths: [
      {
        month: "10/2025",
        departureDates: ["18/10/2025", "25/10/2025"],
        prices: { adult: 2800000, child: 1400000, infant: 0, singleSupplement: 800000 },
        promotions: "🌊 Mùa nước nổi, tặng tour tham quan làng bè.",
        familySuitability: "👨‍👩‍👧‍👦 Trải nghiệm mùa nước nổi đặc trưng của miền Tây.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Rừng tràm Trà Sư đẹp nhất vào mùa nước nổi."
      },
      {
        month: "11/2025",
        departureDates: ["15/11/2025", "29/11/2025"],
        prices: { adult: 2750000, child: 1375000, infant: 0, singleSupplement: 780000 },
        promotions: "✨ Tặng nón lá và khăn rằn.",
        familySuitability: "👨‍👩‍👧‍👦 Tìm hiểu về văn hóa và tín ngưỡng của người dân Nam Bộ.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Nên thử các món đặc sản như bún cá, lẩu mắm."
      },
      {
        month: "12/2025",
        departureDates: ["13/12/2025", "27/12/2025"],
        prices: { adult: 2850000, child: 1425000, infant: 0, singleSupplement: 820000 },
        promotions: "✨ Tặng voucher mua sắm mắm tại chợ Châu Đốc.",
        familySuitability: "🙏 Chuyến đi cuối năm, cầu bình an cho gia đình.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Châu Đốc là 'vương quốc mắm' của miền Tây."
      },
       {
        month: "1/2026",
        departureDates: ["10/01/2026", "24/01/2026"],
        prices: { adult: 3000000, child: 1500000, infant: 0, singleSupplement: 900000 },
        promotions: "🙏 Cao điểm Vía Bà, tặng bộ lễ viếng.",
        familySuitability: "🙏 Dành cho du khách có nhu cầu hành hương, chiêm bái.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Miếu Bà rất đông vào dịp này, cần cẩn thận tư trang."
      },
       {
        month: "2/2026",
        departureDates: ["14/02/2026", "28/02/2026"],
        prices: { adult: 2900000, child: 1450000, infant: 0, singleSupplement: 850000 },
        promotions: "🙏 Du xuân đầu năm, giảm giá 5%.",
        familySuitability: "🙏 Chuyến đi cầu may mắn, tài lộc cho năm mới.",
        flightDeals: "✈️ Tour khởi hành từ TP.HCM bằng xe du lịch.",
        notes: "*Không khí du xuân nhộn nhịp."
      }
    ]
  },
];

