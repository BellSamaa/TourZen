// src/data/tours.js

export const TOURS = [
  {
    id: 1,
    title: "Hạ Long – Kỳ quan thiên nhiên thế giới",
    image: "/images/halong.jpg",
    description: "Khám phá Vịnh Hạ Long, di sản thiên nhiên thế giới với hàng ngàn đảo đá vôi kỳ vĩ và hang động tuyệt đẹp.",
    location: "Quảng Ninh",
    duration: "3 ngày 2 đêm",
    people: 20,
    price: 4590000,
    discount: 10,
    rating: 4.9,
    isFeatured: true,
    isBestseller: true,
    flight: {
      departDate: "13/10/2025",
      departTime: "05:45",
      returnDate: "15/10/2025",
      returnTime: "17:30",
      airline: "Vietravel Airlines",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Hạ Long – Hang Sửng Sốt",
      "Ngày 2: Tham quan đảo Titop, chèo kayak, tắm biển",
      "Ngày 3: Mua sắm đặc sản – Trở về TP.HCM",
    ],
  },
  {
    id: 2,
    title: "Đà Lạt – Thành phố ngàn hoa",
    image: "/images/dalat.jpg",
    description: "Tận hưởng không khí se lạnh, ngắm hoa nở khắp nơi và khám phá những quán cà phê lãng mạn giữa lòng Đà Lạt.",
    location: "Lâm Đồng",
    duration: "3 ngày 2 đêm",
    people: 25,
    price: 3290000,
    discount: 5,
    rating: 4.8,
    isFeatured: true,
    isBestseller: false,
    flight: {
      departDate: "15/10/2025",
      departTime: "06:30",
      returnDate: "17/10/2025",
      returnTime: "16:00",
      airline: "Bamboo Airways",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Đà Lạt – Hồ Xuân Hương",
      "Ngày 2: Thung lũng Tình Yêu – Đồi Mộng Mơ – Dinh Bảo Đại",
      "Ngày 3: Mua đặc sản – Trở về TP.HCM",
    ],
  },
  {
    id: 3,
    title: "Phú Quốc – Thiên đường nghỉ dưỡng",
    image: "/images/phuquoc.jpg",
    description: "Thư giãn tại hòn đảo ngọc xinh đẹp với biển xanh cát trắng, resort sang trọng và các hoạt động thú vị.",
    location: "Kiên Giang",
    duration: "4 ngày 3 đêm",
    people: 30,
    price: 5890000,
    discount: 12,
    rating: 5.0,
    isFeatured: true,
    isBestseller: true,
    flight: {
      departDate: "20/10/2025",
      departTime: "07:00",
      returnDate: "23/10/2025",
      returnTime: "18:30",
      airline: "Vietnam Airlines",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Phú Quốc – Check-in resort",
      "Ngày 2: Tham quan VinWonders – Vinpearl Safari",
      "Ngày 3: Lặn ngắm san hô – Câu cá trên biển",
      "Ngày 4: Tham quan chợ Dương Đông – Trở về TP.HCM",
    ],
  },
  {
    id: 4,
    title: "Sa Pa – Nóc nhà Đông Dương",
    image: "/images/sapa.jpg",
    description: "Khám phá vùng đất mờ sương với ruộng bậc thang hùng vĩ và đỉnh Fansipan – nơi chạm tới mây trời.",
    location: "Lào Cai",
    duration: "4 ngày 3 đêm",
    people: 20,
    price: 4790000,
    discount: 8,
    rating: 4.9,
    isFeatured: true,
    isBestseller: false,
    flight: {
      departDate: "18/10/2025",
      departTime: "05:50",
      returnDate: "21/10/2025",
      returnTime: "19:00",
      airline: "Vietjet Air",
    },
    itinerary: [
      "Ngày 1: Hà Nội – Sa Pa – Nhà thờ đá cổ",
      "Ngày 2: Leo Fansipan – Thưởng ngoạn cảnh núi rừng",
      "Ngày 3: Bản Cát Cát – Mường Hoa",
      "Ngày 4: Quay về Hà Nội – Kết thúc hành trình",
    ],
  },
  {
    id: 5,
    title: "Đà Nẵng – Hội An – Cố đô Huế",
    image: "/images/danang.jpg",
    description: "Hành trình di sản miền Trung: từ bãi biển Mỹ Khê đến phố cổ Hội An và kinh thành Huế mộng mơ.",
    location: "Miền Trung",
    duration: "5 ngày 4 đêm",
    people: 40,
    price: 6590000,
    discount: 10,
    rating: 5.0,
    isFeatured: true,
    isBestseller: true,
    flight: {
      departDate: "10/11/2025",
      departTime: "06:10",
      returnDate: "14/11/2025",
      returnTime: "19:20",
      airline: "Vietnam Airlines",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Đà Nẵng – Ngũ Hành Sơn",
      "Ngày 2: Tham quan phố cổ Hội An",
      "Ngày 3: Bà Nà Hills – Cầu Vàng",
      "Ngày 4: Huế – Đại Nội – Chùa Thiên Mụ",
      "Ngày 5: Mua sắm – Trở về TP.HCM",
    ],
  },
  {
    id: 6,
    title: "Nha Trang – Biển xanh và nắng vàng",
    image: "/images/nhatrang.jpg",
    description: "Trải nghiệm thành phố biển Nha Trang với làn nước trong xanh và những bãi cát dài bất tận.",
    location: "Khánh Hòa",
    duration: "3 ngày 2 đêm",
    people: 25,
    price: 3690000,
    discount: 7,
    rating: 4.7,
    isFeatured: true,
    isBestseller: false,
    flight: {
      departDate: "12/10/2025",
      departTime: "07:10",
      returnDate: "14/10/2025",
      returnTime: "17:00",
      airline: "Bamboo Airways",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Nha Trang – Tháp Bà Ponagar",
      "Ngày 2: Vinpearl Land – Lặn ngắm san hô",
      "Ngày 3: Mua sắm đặc sản – Trở về TP.HCM",
    ],
  },
  {
    id: 7,
    title: "Quy Nhơn – Thiên đường biển mới nổi",
    image: "/images/quynhon.jpg",
    description: "Khám phá Eo Gió, Kỳ Co và những bãi biển hoang sơ đẹp đến ngỡ ngàng.",
    location: "Bình Định",
    duration: "4 ngày 3 đêm",
    people: 20,
    price: 4290000,
    discount: 9,
    rating: 4.8,
    isFeatured: false,
    isBestseller: false,
    flight: {
      departDate: "18/11/2025",
      departTime: "08:00",
      returnDate: "21/11/2025",
      returnTime: "17:45",
      airline: "Vietravel Airlines",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Quy Nhơn – Eo Gió",
      "Ngày 2: Kỳ Co – Lặn ngắm san hô",
      "Ngày 3: Ghềnh Ráng Tiên Sa – Tháp Đôi",
      "Ngày 4: Trở về TP.HCM",
    ],
  },
  {
    id: 8,
    title: "Ninh Bình – Tràng An – Tam Cốc Bích Động",
    image: "/images/ninhbinh.jpg",
    description: "Vẻ đẹp hữu tình giữa sông nước và núi đá, được mệnh danh là Hạ Long trên cạn.",
    location: "Ninh Bình",
    duration: "3 ngày 2 đêm",
    people: 25,
    price: 3790000,
    discount: 6,
    rating: 4.9,
    isFeatured: true,
    isBestseller: false,
    flight: {
      departDate: "21/11/2025",
      departTime: "06:00",
      returnDate: "23/11/2025",
      returnTime: "18:00",
      airline: "Vietnam Airlines",
    },
    itinerary: [
      "Ngày 1: Hà Nội – Ninh Bình – Tam Cốc Bích Động",
      "Ngày 2: Tràng An – Cố đô Hoa Lư",
      "Ngày 3: Thung Nham – Trở về Hà Nội",
    ],
  },
  {
    id: 9,
    title: "Côn Đảo – Vùng biển thiêng liêng",
    image: "/images/condao.jpg",
    description: "Tham quan di tích lịch sử, bãi biển hoang sơ và trải nghiệm không gian linh thiêng của Côn Đảo.",
    location: "Bà Rịa – Vũng Tàu",
    duration: "3 ngày 2 đêm",
    people: 15,
    price: 5290000,
    discount: 10,
    rating: 4.8,
    isFeatured: false,
    isBestseller: false,
    flight: {
      departDate: "25/11/2025",
      departTime: "07:45",
      returnDate: "27/11/2025",
      returnTime: "17:15",
      airline: "VASCO",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Côn Đảo – Bãi Đầm Trầu",
      "Ngày 2: Thăm mộ chị Võ Thị Sáu – Nhà tù Côn Đảo",
      "Ngày 3: Tham quan chợ Côn Đảo – Trở về TP.HCM",
    ],
  },
  {
    id: 10,
    title: "Miền Tây – Sông nước Cửu Long",
    image: "/images/mientay.jpg",
    description: "Trải nghiệm cuộc sống miền sông nước, chợ nổi, vườn trái cây và tình người Nam Bộ.",
    location: "Cần Thơ",
    duration: "2 ngày 1 đêm",
    people: 30,
    price: 1990000,
    discount: 5,
    rating: 4.7,
    isFeatured: false,
    isBestseller: false,
    flight: {
      departDate: "10/12/2025",
      departTime: "07:00",
      returnDate: "11/12/2025",
      returnTime: "15:30",
      airline: "Xe du lịch TourZen",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Cái Bè – Cần Thơ",
      "Ngày 2: Chợ nổi Cái Răng – Vườn trái cây – Trở về TP.HCM",
    ],
  },
  {
    id: 11,
    title: "Hà Giang – Cao nguyên đá Đồng Văn",
    image: "/images/hagiang.jpg",
    description: "Khám phá vẻ đẹp hoang sơ của miền cực Bắc với những con đèo quanh co và cột cờ Lũng Cú.",
    location: "Hà Giang",
    duration: "4 ngày 3 đêm",
    people: 15,
    price: 4890000,
    discount: 7,
    rating: 5.0,
    isFeatured: true,
    isBestseller: true,
    flight: {
      departDate: "05/12/2025",
      departTime: "05:45",
      returnDate: "08/12/2025",
      returnTime: "20:00",
      airline: "Vietnam Airlines",
    },
    itinerary: [
      "Ngày 1: Hà Nội – Hà Giang – Quản Bạ",
      "Ngày 2: Đồng Văn – Lũng Cú – Mã Pí Lèng",
      "Ngày 3: Phó Bảng – Yên Minh",
      "Ngày 4: Trở về Hà Nội",
    ],
  },
  {
    id: 12,
    title: "Buôn Ma Thuột – Cao nguyên cà phê",
    image: "/images/bmt.jpg",
    description: "Khám phá vùng đất Tây Nguyên hùng vĩ, thác Dray Nur và văn hóa cồng chiêng độc đáo.",
    location: "Đắk Lắk",
    duration: "3 ngày 2 đêm",
    people: 20,
    price: 3390000,
    discount: 6,
    rating: 4.6,
    isFeatured: false,
    isBestseller: false,
    flight: {
      departDate: "08/12/2025",
      departTime: "06:15",
      returnDate: "10/12/2025",
      returnTime: "17:00",
      airline: "Vietravel Airlines",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Buôn Ma Thuột – Bảo tàng cà phê",
      "Ngày 2: Hồ Lắk – Thác Dray Nur",
      "Ngày 3: Mua cà phê – Trở về TP.HCM",
    ],
  },
  {
    id: 13,
    title: "Vũng Tàu – Biển gần Sài Gòn",
    image: "/images/vungtau.jpg",
    description: "Chuyến đi ngắn cuối tuần thư giãn bên bờ biển trong xanh và hải sản tươi ngon.",
    location: "Bà Rịa – Vũng Tàu",
    duration: "2 ngày 1 đêm",
    people: 30,
    price: 1590000,
    discount: 4,
    rating: 4.5,
    isFeatured: false,
    isBestseller: false,
    flight: {
      departDate: "12/12/2025",
      departTime: "08:00",
      returnDate: "13/12/2025",
      returnTime: "17:00",
      airline: "Xe du lịch TourZen",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Vũng Tàu – Tượng Chúa Kito",
      "Ngày 2: Tắm biển – Ăn hải sản – Trở về TP.HCM",
    ],
  },
  {
    id: 14,
    title: "Huế – Kinh thành cổ kính",
    image: "/images/hue.jpg",
    description: "Chiêm ngưỡng di sản văn hóa thế giới, Hoàng thành và những câu ca trữ tình trên sông Hương.",
    location: "Thừa Thiên Huế",
    duration: "3 ngày 2 đêm",
    people: 20,
    price: 4290000,
    discount: 8,
    rating: 4.8,
    isFeatured: false,
    isBestseller: false,
    flight: {
      departDate: "15/12/2025",
      departTime: "06:20",
      returnDate: "17/12/2025",
      returnTime: "19:00",
      airline: "Vietnam Airlines",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Huế – Đại Nội",
      "Ngày 2: Lăng Khải Định – Sông Hương – Chợ Đông Ba",
      "Ngày 3: Tự do khám phá – Trở về TP.HCM",
    ],
  },
  {
    id: 15,
    title: "Hội An – Phố cổ lung linh",
    image: "/images/hoian.jpg",
    description: "Dạo bước trong phố cổ với những chiếc đèn lồng rực rỡ và thưởng thức ẩm thực truyền thống.",
    location: "Quảng Nam",
    duration: "3 ngày 2 đêm",
    people: 25,
    price: 3890000,
    discount: 5,
    rating: 4.9,
    isFeatured: false,
    isBestseller: false,
    flight: {
      departDate: "20/12/2025",
      departTime: "07:00",
      returnDate: "22/12/2025",
      returnTime: "18:00",
      airline: "Bamboo Airways",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Đà Nẵng – Hội An",
      "Ngày 2: Tham quan phố cổ – Thưởng thức Cao Lầu",
      "Ngày 3: Tự do mua sắm – Trở về TP.HCM",
    ],
  },
  {
    id: 16,
    title: "Cần Thơ – Chợ nổi miền Tây",
    image: "/images/cantho.jpg",
    description: "Trải nghiệm văn hóa sông nước với chợ nổi Cái Răng, nhà cổ Bình Thủy và vườn trái cây trĩu quả.",
    location: "Cần Thơ",
    duration: "2 ngày 1 đêm",
    people: 20,
    price: 1890000,
    discount: 3,
    rating: 4.7,
    isFeatured: false,
    isBestseller: false,
    flight: {
      departDate: "22/12/2025",
      departTime: "07:30",
      returnDate: "23/12/2025",
      returnTime: "15:30",
      airline: "Xe du lịch TourZen",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Cần Thơ – Nhà cổ Bình Thủy",
      "Ngày 2: Chợ nổi Cái Răng – Vườn trái cây – Trở về TP.HCM",
    ],
  },
  {
    id: 17,
    title: "Pleiku – Mảnh đất bazan đỏ lửa",
    image: "/images/pleiku.jpg",
    description: "Khám phá Biển Hồ, thác Phú Cường và thưởng thức cà phê giữa lòng cao nguyên Pleiku.",
    location: "Gia Lai",
    duration: "3 ngày 2 đêm",
    people: 15,
    price: 3490000,
    discount: 5,
    rating: 4.6,
    isFeatured: false,
    isBestseller: false,
    flight: {
      departDate: "28/12/2025",
      departTime: "06:45",
      returnDate: "30/12/2025",
      returnTime: "17:15",
      airline: "Vietnam Airlines",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Pleiku – Biển Hồ",
      "Ngày 2: Thác Phú Cường – Nhà thờ Gỗ",
      "Ngày 3: Thưởng thức cà phê – Trở về TP.HCM",
    ],
  },
  {
    id: 18,
    title: "Phan Thiết – Mũi Né",
    image: "/images/phanthiet.jpg",
    description: "Check-in đồi cát bay, bãi biển đẹp và thưởng thức hải sản tươi ngon.",
    location: "Bình Thuận",
    duration: "3 ngày 2 đêm",
    people: 30,
    price: 2890000,
    discount: 6,
    rating: 4.7,
    isFeatured: false,
    isBestseller: false,
    flight: {
      departDate: "05/01/2026",
      departTime: "07:00",
      returnDate: "07/01/2026",
      returnTime: "17:00",
      airline: "Xe du lịch TourZen",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Mũi Né – Đồi cát bay",
      "Ngày 2: Suối Tiên – Bãi đá Ông Địa",
      "Ngày 3: Tắm biển – Trở về TP.HCM",
    ],
  },
  {
    id: 19,
    title: "Lý Sơn – Viên ngọc giữa biển khơi",
    image: "/images/lyson.jpg",
    description: "Tham quan đảo Lớn, đảo Bé và ngắm hoàng hôn tuyệt đẹp trên đỉnh Thới Lới.",
    location: "Quảng Ngãi",
    duration: "3 ngày 2 đêm",
    people: 15,
    price: 4190000,
    discount: 7,
    rating: 4.9,
    isFeatured: false,
    isBestseller: false,
    flight: {
      departDate: "10/01/2026",
      departTime: "07:30",
      returnDate: "12/01/2026",
      returnTime: "18:30",
      airline: "Vietnam Airlines",
    },
    itinerary: [
      "Ngày 1: TP.HCM – Quảng Ngãi – Lý Sơn",
      "Ngày 2: Tham quan đảo Bé – Đỉnh Thới Lới",
      "Ngày 3: Tự do khám phá – Trở về TP.HCM",
    ],
  },
  {
    id: 20,
    title: "Tràng An – Bái Đính – Hang Múa",
    image: "/images/trangan.jpg",
    description: "Khám phá quần thể danh thắng Tràng An, chùa Bái Đính và chinh phục đỉnh Hang Múa với tầm nhìn toàn cảnh.",
    location: "Ninh Bình",
    duration: "3 ngày 2 đêm",
    people: 25,
    price: 3890000,
    discount: 6,
    rating: 4.8,
    isFeatured: false,
    isBestseller: false,
    flight: {
      departDate: "15/01/2026",
      departTime: "06:00",
      returnDate: "17/01/2026",
      returnTime: "18:00",
      airline: "Vietnam Airlines",
    },
    itinerary: [
      "Ngày 1: Hà Nội – Ninh Bình – Bái Đính",
      "Ngày 2: Tràng An – Hang Múa",
      "Ngày 3: Tự do tham quan – Trở về Hà Nội",
    ],
  },
];
// DESTINATIONS với mô tả ngắn kiểu văn học
export const DESTINATIONS = [
  { id: 1, name: "Sa Pa", image: "/images/sapa.jpg", description: "Núi rừng mờ sương, ruộng bậc thang hùng vĩ và văn hóa dân tộc độc đáo." },
  { id: 2, name: "Hạ Long", image: "/images/halong.jpg", description: "Vịnh biển với hàng nghìn đảo đá vôi kỳ vĩ và hang động huyền bí." },
  { id: 3, name: "Đà Lạt", image: "/images/dalat.jpg", description: "Thành phố ngàn hoa, khí trời se lạnh và quán cà phê thơ mộng." },
  { id: 4, name: "Phú Quốc", image: "/images/phuquoc.jpg", description: "Hòn đảo ngọc với biển xanh, cát trắng và resort sang trọng." },
  { id: 5, name: "Ninh Bình", image: "/images/ninhbinh.jpg", description: "Cố đô với cảnh quan sông núi hữu tình và chùa chiền cổ kính." },
  { id: 6, name: "Huế", image: "/images/hue.jpg", description: "Cố đô mộng mơ, kinh thành cổ kính và di sản văn hóa phong phú." },
  { id: 7, name: "Hội An", image: "/images/hoian.jpg", description: "Phố cổ lãng mạn, đèn lồng lung linh và văn hóa truyền thống." },
  { id: 8, name: "Nha Trang", image: "/images/nhatrang.jpg", description: "Thành phố biển sôi động với bãi cát trắng và hoạt động giải trí đa dạng." },
  { id: 9, name: "Côn Đảo", image: "/images/condao.jpg", description: "Hòn đảo hoang sơ, biển xanh trong và lịch sử hào hùng." },
  { id: 10, name: "Miền Tây", image: "/images/mientay.jpg", description: "Vùng sông nước, miệt vườn trù phú và đời sống dân dã bình yên." },
  { id: 11, name: "Vũng Tàu", image: "/images/vungtau.jpg", description: "Bãi biển sôi động, hải sản tươi ngon và đường ven biển thơ mộng." },
  { id: 12, name: "Đà Nẵng", image: "/images/danang.jpg", description: "Thành phố hiện đại với cầu Rồng, biển Mỹ Khê và núi Ngũ Hành Sơn." },
  { id: 13, name: "Hà Giang", image: "/images/hagiang.jpg", description: "Cao nguyên đá, hẻm vực sâu và phong cảnh núi non hùng vĩ." },
  { id: 14, name: "Buôn Ma Thuột", image: "/images/bmt.jpg", description: "Vùng đất cà phê, văn hóa dân tộc và thác Dray Nur hùng vĩ." },
  { id: 15, name: "Pleiku", image: "/images/pleiku.jpg", description: "Cao nguyên nắng gió, hồ T’nưng thơ mộng và văn hóa Tây Nguyên đặc sắc." },
  { id: 16, name: "Phan Thiết – Mũi Né", image: "/images/phanthiet.jpg", description: "Biển xanh, đồi cát vàng và làng chài bình yên." },
  { id: 17, name: "Quy Nhơn", image: "/images/quynhon.jpg", description: "Thành phố biển với bãi tắm hoang sơ, hải sản tươi ngon và phong cảnh hữu tình." },
  { id: 18, name: "Lý Sơn", image: "/images/lyson.jpg", description: "Đảo tiền sử, cánh đồng tỏi thơm và biển đảo bao la." },
  { id: 19, name: "Tràng An", image: "/images/trangan.jpg", description: "Quần thể sinh thái núi non sông nước kỳ vĩ và hang động huyền bí." },
  { id: 20, name: "Cát Bà", image: "/images/catba.jpg", description: "Hòn đảo lớn với rừng nguyên sinh, biển xanh và làng chài cổ kính." },
  { id: 21, name: "Mộc Châu", image: "/images/mocchau.jpg", description: "Cao nguyên xanh mướt, đồi chè bát ngát và hoa mận nở trắng xóa." },
  { id: 22, name: "Tam Đảo", image: "/images/tamdao.jpg", description: "Thị trấn mù sương, núi rừng xanh biếc và khí hậu mát lành." },
  { id: 23, name: "Phú Yên", image: "/images/phuyen.jpg", description: "Bãi biển hoang sơ, ghềnh đá đẹp và nắng vàng rực rỡ." },
  { id: 24, name: "Kon Tum", image: "/images/kontum.jpg", description: "Cao nguyên Tây Nguyên, văn hóa dân tộc và cảnh sắc núi rừng hùng vĩ." },
  { id: 25, name: "Đồng Hới", image: "/images/donghoi.jpg", description: "Cửa ngõ miền Trung với biển xanh, hang động và di tích lịch sử." },
  { id: 26, name: "Mai Châu", image: "/images/maichau.jpg", description: "Thung lũng xanh mướt, bản làng dân tộc và khí hậu trong lành." },
  { id: 27, name: "Điện Biên Phủ", image: "/images/dienbien.jpg", description: "Thành phố lịch sử với đồi núi hùng vĩ và dấu ấn chiến tranh." },
  { id: 28, name: "Sa Huỳnh", image: "/images/sahuynh.jpg", description: "Bãi biển hoang sơ, làng chài truyền thống và biển xanh mênh mông." },
  { id: 29, name: "Bái Tử Long", image: "/images/baitu_long.jpg", description: "Vịnh đẹp với đảo đá vôi, biển xanh và cảnh quan hoang sơ." },
  { id: 30, name: "Mũi Kê Gà", image: "/images/ke_ga.jpg", description: "Ngọn hải đăng cổ kính, biển xanh và khung cảnh yên bình." },
  { id: 31, name: "Yên Tử", image: "/images/yentu.jpg", description: "Ngọn núi linh thiêng, chùa chiền cổ kính và cảnh sắc hùng vĩ." },
  { id: 32, name: "Tam Cốc", image: "/images/tamcoc.jpg", description: "Sông nước hữu tình, núi đá vôi và cánh đồng lúa chín vàng." },
  { id: 33, name: "Phong Nha", image: "/images/phongnha.jpg", description: "Hang động kỳ vĩ, núi đá vôi và sông ngầm huyền bí." },
  { id: 34, name: "Vịnh Lan Hạ", image: "/images/lanha.jpg", description: "Biển xanh, đảo đá vôi và cảnh quan thiên nhiên hoang sơ." },
  { id: 35, name: "Đảo Cô Tô", image: "/images/coto.jpg", description: "Hòn đảo xinh đẹp, bãi biển trắng và khí hậu trong lành." },
  { id: 36, name: "Hòn Sơn", image: "/images/honson.jpg", description: "Đảo nhỏ với biển xanh, núi rừng và làng chài yên bình." },
  { id: 37, name: "Bà Nà Hills", image: "/images/bana.jpg", description: "Khu nghỉ dưỡng trên núi, khí hậu mát lạnh và cảnh quan châu Âu." },
  { id: 38, name: "Suối Tiên – Mũi Né", image: "/images/suoutien.jpg", description: "Bãi biển tuyệt đẹp, suối nước trong xanh và cồn cát vàng." },
  { id: 39, name: "Hang Én", image: "/images/halen.jpg", description: "Hang động khổng lồ giữa núi rừng hoang sơ và cảnh sắc hùng vĩ." },
  { id: 40, name: "Đảo Phú Quý", image: "/images/phuquy.jpg", description: "Hòn đảo hoang sơ, biển xanh và những làng chài yên bình." },

// src/data/tours_updated.js


  // Tour 1: Phan Thiết
  {
    id: 1,
    title: "Tour Du Lịch Phan Thiết - Mũi Né - Lâu Đài Rượu Vang",
    location: "Phan Thiết, Mũi Né",
    region: "Miền Nam",
    image: "/images/tour-phanthiet.jpg",
    galleryImages: ["/images/tour-phanthiet.jpg", "/images/gallery/phanthiet-1.jpg", "/images/gallery/phanthiet-2.jpg"],
    price: 3590000,
    duration: "4 ngày 3 đêm",
    rating: 4.8,
    description: "Tận hưởng biển xanh, cát trắng tại Mũi Né, khám phá đồi cát bay kỳ ảo và thưởng thức rượu vang hảo hạng tại lâu đài Sealinks.",
    itinerary: [
      { day: "Ngày 1", description: "TP.HCM - Phan Thiết - Mũi Né - Đồi Cát Bay." },
      { day: "Ngày 2", description: "Bàu Trắng - Lâu Đài Rượu Vang - Sealinks City." },
      { day: "Ngày 3", description: "Tự do khám phá hoặc tham quan các điểm lân cận." },
      { day: "Ngày 4", description: "Phan Thiết - TP.HCM. Mua sắm đặc sản." },
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
    region: "Miền Nam",
    image: "/images/tour-phuquoc.jpg",
    galleryImages: ["/images/tour-phuquoc.jpg", "/images/gallery/phuquoc-1.jpg", "/images/gallery/phuquoc-2.jpg"],
    price: 4250000,
    duration: "3 ngày 2 đêm",
    rating: 4.9,
    description: "Đắm mình trong làn nước biển trong xanh tại Bãi Sao, khám phá thế giới san hô đầy màu sắc và thưởng thức hải sản tươi ngon.",
    itinerary: [
      { day: "Ngày 1", description: "Tham quan Đông đảo: Dinh Cậu, vườn tiêu, nhà thùng nước mắm." },
      { day: "Ngày 2", description: "Khám phá Nam đảo: Bãi Sao, nhà tù Phú Quốc, cáp treo Hòn Thơm." },
      { day: "Ngày 3", description: "Tự do mua sắm tại chợ đêm Dinh Cậu, khởi hành về lại." },
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
    title: "Đà Nẵng - Hội An - Bà Nà Hills - Con Đường Di Sản",
    location: "Đà Nẵng, Hội An, Quảng Nam",
    region: "Miền Trung",
    image: "/images/tour-danang.jpg",
    galleryImages: ["/images/tour-danang.jpg", "/images/gallery/danang-1.jpg", "/images/gallery/danang-2.jpg"],
    price: 5100000,
    duration: "4 ngày 3 đêm",
    rating: 4.9,
    description: "Trải nghiệm thành phố đáng sống nhất Việt Nam, dạo bước trên Cầu Vàng, khám phá phố cổ Hội An và thưởng thức ẩm thực đặc sắc.",
    itinerary: [
      { day: "Ngày 1", description: "Đón khách tại Đà Nẵng, tham quan bán đảo Sơn Trà, chùa Linh Ứng." },
      { day: "Ngày 2", description: "Khám phá Bà Nà Hills, Cầu Vàng, Làng Pháp." },
      { day: "Ngày 3", description: "Dạo chơi Phố cổ Hội An về đêm, đi thuyền thả hoa đăng." },
      { day: "Ngày 4", description: "Tự do tắm biển Mỹ Khê, mua sắm đặc sản, tiễn sân bay." }
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
    region: "Miền Bắc",
    image: "/images/tour-halong.jpg",
    galleryImages: ["/images/tour-halong.jpg", "/images/gallery/halong-1.jpg", "/images/gallery/halong-2.jpg"],
    price: 6200000,
    duration: "5 ngày 4 đêm",
    rating: 4.8,
    description: "Hành trình khám phá trọn vẹn vẻ đẹp Bắc Bộ với 36 phố phường Hà Nội, kỳ quan Vịnh Hạ Long và non nước hữu tình Ninh Bình.",
    itinerary: [
        { day: "Ngày 1", description: "Tham quan 36 phố phường Hà Nội, Lăng Bác, Hồ Gươm." },
        { day: "Ngày 2", description: "Du thuyền Vịnh Hạ Long, tham quan hang Sửng Sốt, chèo kayak." },
        { day: "Ngày 3", description: "Ngủ đêm trên du thuyền 5 sao giữa vịnh." },
        { day: "Ngày 4", description: "Khám phá Tràng An - Ninh Bình, ngồi thuyền xuyên hang động." },
        { day: "Ngày 5", description: "Chinh phục Hang Múa, ngắm toàn cảnh Tam Cốc, trở về Hà Nội." }
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
    region: "Miền Nam",
    image: "/images/tour-dalat.jpg",
    galleryImages: ["/images/tour-dalat.jpg", "/images/gallery/dalat-1.jpg", "/images/gallery/dalat-2.jpg"],
    price: 2990000,
    duration: "3 ngày 2 đêm",
    rating: 4.7,
    description: "Lạc bước giữa thành phố ngàn hoa với không khí se lạnh, những quán cà phê view đồi và các điểm check-in không thể bỏ lỡ.",
    itinerary: [
        { day: "Ngày 1", description: "Khám phá Thác Datanla, Thiền Viện Trúc Lâm, Hồ Tuyền Lâm." },
        { day: "Ngày 2", description: "Check-in tại Quảng trường Lâm Viên, Ga Đà Lạt, Vườn hoa thành phố." },
        { day: "Ngày 3", description: "Thưởng thức đặc sản tại chợ đêm Đà Lạt, mua sắm quà lưu niệm." }
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
    region: "Miền Bắc",
    image: "/images/tour-sapa.jpg",
    galleryImages: ["/images/tour-sapa.jpg", "/images/gallery/sapa-1.jpg", "/images/gallery/sapa-2.jpg"],
    price: 4500000,
    duration: "3 ngày 2 đêm",
    rating: 4.8,
    description: "Chạm tay vào 'Nóc nhà Đông Dương', săn mây trên đỉnh Fansipan và khám phá nét văn hóa độc đáo của các dân tộc thiểu số.",
    itinerary: [
        { day: "Ngày 1", description: "Di chuyển Hà Nội - Sapa bằng xe giường nằm cao cấp." },
        { day: "Ngày 2", description: "Chinh phục 'Nóc nhà Đông Dương' bằng cáp treo Fansipan." },
        { day: "Ngày 3", description: "Tham quan bản Cát Cát, nhà thờ Đá, chợ Sapa." }
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
    region: "Miền Trung",
    image: "/images/tour-quynhon.jpg",
    galleryImages: ["/images/tour-quynhon.jpg", "/images/gallery/quynhon-1.jpg", "/images/gallery/quynhon-2.jpg"],
    price: 3800000,
    duration: "4 ngày 3 đêm",
    rating: 4.7,
    description: "Hành trình về 'xứ Nẫu', chiêm ngưỡng vẻ đẹp độc đáo của Gành Đá Đĩa và thả hồn vào khung cảnh phim trường 'Tôi thấy hoa vàng trên cỏ xanh'.",
    itinerary: [
        { day: "Ngày 1", description: "Khám phá Eo Gió, Kỳ Co - 'Maldives của Việt Nam'." },
        { day: "Ngày 2", description: "Tham quan Tháp Đôi, Ghềnh Ráng Tiên Sa, mộ Hàn Mặc Tử." },
        { day: "Ngày 3", description: "Di chuyển đến Phú Yên, check-in tại Gành Đá Đĩa, Bãi Xép." },
        { day: "Ngày 4", description: "Tham quan Mũi Điện - cực Đông của Tổ quốc, Tháp Nghinh Phong." }
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
    region: "Miền Trung",
    image: "/images/tour-nhatrang.jpg",
    galleryImages: ["/images/tour-nhatrang.jpg", "/images/gallery/nhatrang-1.jpg", "/images/gallery/nhatrang-2.jpg"],
    price: 3200000,
    duration: "3 ngày 2 đêm",
    rating: 4.8,
    description: "Vui chơi thả ga tại VinWonders, thư giãn với dịch vụ tắm bùn khoáng cao cấp và khám phá một trong những vịnh biển đẹp nhất thế giới.",
    itinerary: [
        { day: "Ngày 1", description: "Tham quan Viện Hải dương học, Chùa Long Sơn, Tháp Bà Ponagar." },
        { day: "Ngày 2", description: "Vui chơi không giới hạn tại VinWonders Nha Trang trên đảo Hòn Tre." },
        { day: "Ngày 3", description: "Thư giãn và tắm bùn khoáng tại khu du lịch Hòn Tằm." }
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
    region: "Miền Nam",
    image: "/images/tour-condao.jpg",
    galleryImages: ["/images/tour-condao.jpg", "/images/gallery/condao-1.jpg", "/images/gallery/condao-2.jpg"],
    price: 5500000,
    duration: "2 ngày 1 đêm",
    rating: 4.9,
    description: "Hành trình tâm linh về với miền đất thiêng, viếng mộ chị Võ Thị Sáu, tìm hiểu lịch sử đấu tranh hào hùng và khám phá vẻ đẹp hoang sơ của Côn Đảo.",
    itinerary: [
        { day: "Ngày 1", description: "Viếng Nghĩa trang Hàng Dương, mộ chị Võ Thị Sáu. Tham quan hệ thống nhà tù Côn Đảo." },
        { day: "Ngày 2", description: "Khám phá Bãi Đầm Trầu, lặn ngắm san hô tại Hòn Bảy Cạnh và trở về." }
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
    region: "Miền Bắc",
    image: "/images/tour-hagiang.jpg",
    galleryImages: ["/images/tour-hagiang.jpg", "/images/gallery/hagiang-1.jpg", "/images/gallery/hagiang-2.jpg"],
    price: 3900000,
    duration: "4 ngày 3 đêm",
    rating: 4.9,
    description: "Chinh phục những cung đường đèo hùng vĩ, check-in Cột cờ Lũng Cú, đi thuyền trên sông Nho Quế và đắm chìm trong sắc hoa tam giác mạch.",
    itinerary: [
        { day: "Ngày 1", description: "Hà Nội - Hà Giang - Cổng trời Quản Bạ." },
        { day: "Ngày 2", description: "Check-in tại Dinh thự họ Vương, Cột cờ Lũng Cú, Phố cổ Đồng Văn." },
        { day: "Ngày 3", description: "Chinh phục Mã Pí Lèng, đi thuyền trên sông Nho Quế, ngắm hẻm Tu Sản." },
        { day: "Ngày 4", description: "Hà Giang - Hà Nội, ngắm hoa tam giác mạch trên đường (vào mùa)." }
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
    region: "Miền Trung",
    image: "/images/tour-hue.jpg",
    galleryImages: ["/images/tour-hue.jpg", "/images/gallery/hue-1.jpg", "/images/gallery/hue-2.jpg"],
    price: 2800000,
    duration: "3 ngày 2 đêm",
    rating: 4.6,
    description: "Trở về quá khứ với kinh thành Huế uy nghiêm, lăng tẩm cổ kính và thả hồn theo điệu ca Huế trên dòng sông Hương thơ mộng.",
    itinerary: [
        { day: "Ngày 1", description: "Tham quan Đại Nội Huế, lăng Khải Định, lăng Minh Mạng." },
        { day: "Ngày 2", description: "Đi thuyền rồng trên sông Hương, nghe ca Huế." },
        { day: "Ngày 3", description: "Viếng Chùa Thiên Mụ, tham quan Làng hương Thủy Xuân." }
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
    region: "Miền Nam",
    image: "/images/tour-mientay.jpg",
    galleryImages: ["/images/tour-mientay.jpg", "/images/gallery/mientay-1.jpg", "/images/gallery/mientay-2.jpg"],
    price: 2500000,
    duration: "2 ngày 1 đêm",
    rating: 4.5,
    description: "Về với miền Tây sông nước, đi xuồng ba lá, nghe đờn ca tài tử, thưởng thức trái cây tại vườn và trải nghiệm không khí nhộn nhịp của chợ nổi Cái Răng.",
    itinerary: [
        { day: "Ngày 1", description: "Đi thuyền trên sông Tiền, tham quan 4 cồn Long, Lân, Quy, Phụng, nghe đờn ca tài tử." },
        { day: "Ngày 2", description: "Tham quan Chợ nổi Cái Răng (Cần Thơ) vào sáng sớm và trở về TP.HCM." }
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
    region: "Miền Bắc",
    image: "/images/tour-catba.jpg",
    galleryImages: ["/images/tour-catba.jpg", "/images/gallery/catba-1.jpg", "/images/gallery/catba-2.jpg"],
    price: 3100000,
    duration: "3 ngày 2 đêm",
    rating: 4.6,
    description: "Khám phá vẻ đẹp hoang sơ của Vịnh Lan Hạ, trekking Vườn Quốc gia Cát Bà và thư giãn trên những bãi biển trong xanh.",
    itinerary: [
        { day: "Ngày 1", description: "Di chuyển Hà Nội - Cát Bà, tắm biển tại các bãi Cát Cò." },
        { day: "Ngày 2", description: "Du thuyền khám phá Vịnh Lan Hạ, làng chài Cái Bèo, chèo kayak." },
        { day: "Ngày 3", description: "Trekking Vườn Quốc gia Cát Bà, tham quan Pháo đài Thần công và trở về." }
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
    region: "Miền Bắc",
    image: "/images/tour-puluong.jpg",
    galleryImages: ["/images/tour-puluong.jpg", "/images/gallery/puluong-1.jpg", "/images/gallery/puluong-2.jpg"],
    price: 2900000,
    duration: "3 ngày 2 đêm",
    rating: 4.8,
    description: "'Trốn phố về quê' với thung lũng Mai Châu yên bình, những thửa ruộng bậc thang Pù Luông mùa lúa chín và không khí trong lành của núi rừng.",
    itinerary: [
        { day: "Ngày 1", description: "Khám phá thung lũng Mai Châu, đạp xe qua bản Lác, bản Poom Cọong." },
        { day: "Ngày 2", description: "Trekking tại Khu bảo tồn Pù Luông, ngắm ruộng bậc thang, check-in guồng nước." },
        { day: "Ngày 3", description: "Tham quan thác Hiêu và trở về Hà Nội." }
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
    region: "Miền Trung",
    image: "/images/tour-phongnha.jpg",
    galleryImages: ["/images/tour-phongnha.jpg", "/images/gallery/phongnha-1.jpg", "/images/gallery/phongnha-2.jpg"],
    price: 4200000,
    duration: "3 ngày 2 đêm",
    rating: 4.9,
    description: "Chiêm ngưỡng vẻ đẹp kỳ vĩ của Động Phong Nha và Động Thiên Đường, đồng thời thử thách bản thân với trò Zipline và tắm bùn tại Hang Tối.",
    itinerary: [
        { day: "Ngày 1", description: "Tham quan Động Phong Nha - ngồi thuyền đi vào trong động." },
        { day: "Ngày 2", description: "Khám phá Động Thiên Đường - 'hoàng cung trong lòng đất'." },
        { day: "Ngày 3", description: "Trải nghiệm Zipline và tắm bùn tại Sông Chày - Hang Tối." }
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
    region: "Miền Trung",
    image: "/images/tour-lyson.jpg",
    galleryImages: ["/images/tour-lyson.jpg", "/images/gallery/lyson-1.jpg", "/images/gallery/lyson-2.jpg"],
    price: 3500000,
    duration: "2 ngày 1 đêm",
    rating: 4.6,
    description: "Khám phá hòn đảo tiền tiêu của Tổ quốc, chiêm ngưỡng Cổng Tò Vò độc đáo, lặn ngắm san hô ở Đảo Bé và thưởng thức đặc sản tỏi Lý Sơn.",
    itinerary: [
        { day: "Ngày 1", description: "Di chuyển ra đảo lớn, tham quan Chùa Hang, Cổng Tò Vò, đỉnh Thới Lới." },
        { day: "Ngày 2", description: "Đi cano ra Đảo Bé, tự do tắm biển, lặn ngắm san hô và trở về đất liền." }
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
    region: "Miền Nam",
    image: "/images/tour-vungtau.jpg",
    galleryImages: ["/images/tour-vungtau.jpg", "/images/gallery/vungtau-1.jpg", "/images/gallery/vungtau-2.jpg"],
    price: 1500000,
    duration: "2 ngày 1 đêm",
    rating: 4.4,
    description: "Chuyến đi 'đổi gió' cuối tuần nhanh chóng và tiện lợi, tận hưởng không khí biển, thưởng thức hải sản tươi ngon và check-in các điểm nổi tiếng.",
    itinerary: [
        { day: "Ngày 1", description: "Tắm biển tại Bãi Sau, tham quan Tượng Chúa Kitô Vua, Mũi Nghinh Phong." },
        { day: "Ngày 2", description: "Check-in tại ngọn hải đăng, thưởng thức bánh khọt và trở về." }
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
    region: "Miền Trung",
    image: "/images/tour-taynguyen.jpg",
    galleryImages: ["/images/tour-taynguyen.jpg", "/images/gallery/taynguyen-1.jpg", "/images/gallery/taynguyen-2.jpg"],
    price: 3200000,
    duration: "3 ngày 2 đêm",
    rating: 4.7,
    description: "Lắng nghe tiếng gọi đại ngàn, khám phá thủ phủ cà phê, chiêm ngưỡng những dòng thác hùng vĩ và trải nghiệm văn hóa cồng chiêng đặc sắc.",
    itinerary: [
        { day: "Ngày 1", description: "Tham quan Làng cà phê Trung Nguyên, Bảo tàng Thế giới Cà phê." },
        { day: "Ngày 2", description: "Khám phá cụm thác Dray Nur, Dray Sáp." },
        { day: "Ngày 3", description: "Trải nghiệm cưỡi voi, đi thuyền độc mộc tại Hồ Lắk." }
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
    region: "Miền Bắc",
    image: "/images/tour-mocchau.jpg",
    galleryImages: ["/images/tour-mocchau.jpg", "/images/gallery/mocchau-1.jpg", "/images/gallery/mocchau-2.jpg"],
    price: 2500000,
    duration: "2 ngày 1 đêm",
    rating: 4.7,
    description: "Đắm mình trong vẻ đẹp của đồi chè trái tim, khám phá những thung lũng hoa mận trắng xóa và tận hưởng không khí trong lành của cao nguyên.",
    itinerary: [
        { day: "Ngày 1", description: "Hà Nội - Mộc Châu, check-in tại đồi chè trái tim, thác Dải Yếm." },
        { day: "Ngày 2", description: "Tham quan rừng thông Bản Áng, thung lũng mận Nà Ka và trở về." }
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
    region: "Miền Nam",
    image: "/images/tour-chaudoc.jpg",
    galleryImages: ["/images/tour-chaudoc.jpg", "/images/gallery/chaudoc-1.jpg", "/images/gallery/chaudoc-2.jpg"],
    price: 2800000,
    duration: "3 ngày 2 đêm",
    rating: 4.6,
    description: "Hành trình kết hợp khám phá văn hóa sông nước Cần Thơ và du lịch tâm linh tại Châu Đốc, viếng Miếu Bà Chúa Xứ và khám phá rừng tràm Trà Sư.",
    itinerary: [
        { day: "Ngày 1", description: "Tham quan Chợ nổi Cái Răng, Thiền viện Trúc Lâm Phương Nam (Cần Thơ)." },
        { day: "Ngày 2", description: "Di chuyển đến Châu Đốc, viếng Miếu Bà Chúa Xứ Núi Sam, Lăng Thoại Ngọc Hầu." },
        { day: "Ngày 3", description: "Khám phá Rừng tràm Trà Sư và mua sắm đặc sản mắm." }
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