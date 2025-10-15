import React from "react";
import { motion } from "framer-motion";
import { FaRegCompass, FaUsers, FaLeaf, FaShieldAlt, FaHandshake } from 'react-icons/fa';

export default function About() {
  const features = [
    {
      icon: <FaRegCompass className="text-4xl text-white" />,
      title: "Hành Trình Độc Đáo",
      description: "Chúng tôi thiết kế những tour du lịch không chỉ là tham quan, mà là trải nghiệm văn hóa và khám phá sâu sắc.",
    },
    {
      icon: <FaUsers className="text-4xl text-white" />,
      title: "Đội Ngũ Chuyên Gia",
      description: "Hướng dẫn viên và nhân viên của chúng tôi là những người am hiểu địa phương, nhiệt huyết và luôn sẵn sàng hỗ trợ bạn.",
    },
    {
      icon: <FaLeaf className="text-4xl text-white" />,
      title: "Du Lịch Bền Vững",
      description: "TourZen cam kết bảo vệ môi trường và hỗ trợ cộng đồng địa phương qua các hoạt động du lịch có trách nhiệm.",
    },
     {
      icon: <FaShieldAlt className="text-4xl text-white" />,
      title: "An Toàn Là Trên Hết",
      description: "Sự an toàn và thoải mái của bạn là ưu tiên hàng đầu trong mọi hành trình chúng tôi tổ chức.",
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[50vh] flex items-center justify-center text-white"
        style={{ backgroundImage: "url('/images/about_hero.jpg')" }} // Thêm ảnh này vào public/images
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center z-10 px-4"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Về TourZen</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl">Cánh cửa mở ra thế giới - Nơi mỗi chuyến đi là một câu chuyện đáng nhớ.</p>
        </motion.div>
      </section>

      {/* Main Content Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Our Story */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold text-blue-800 mb-4">Câu Chuyện Của Chúng Tôi</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              TourZen được sinh ra từ niềm đam mê cháy bỏng với du lịch và khát khao kết nối con người với vẻ đẹp vô tận của thế giới. Chúng tôi tin rằng du lịch không chỉ là việc di chuyển từ điểm A đến điểm B, mà là một hành trình chữa lành, làm giàu thêm tâm hồn và mở rộng tầm nhìn.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Bắt đầu từ một nhóm nhỏ những người bạn chung chí hướng, chúng tôi đã đi khắp các nẻo đường, từ những bản làng xa xôi trên rẻo cao Tây Bắc đến những bãi biển cát trắng nắng vàng ở miền Nam. Chính những trải nghiệm đó đã thôi thúc chúng tôi xây dựng nên TourZen - một nền tảng mà ở đó, mỗi chuyến đi đều được chăm chút tỉ mỉ, mang đậm dấu ấn cá nhân và đầy ắp những kỷ niệm khó phai.
            </p>
          </motion.div>
           <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true, amount: 0.5 }}
             transition={{ duration: 0.7 }}
             className="rounded-xl overflow-hidden shadow-2xl"
           >
            <img src="/images/our_story.jpg" alt="Đội ngũ TourZen" className="w-full h-full object-cover" /> 
          </motion.div>
        </div>

        {/* Our Mission */}
        <div className="mt-24 text-center">
            <FaHandshake className="text-5xl text-blue-600 mx-auto mb-4"/>
            <h2 className="text-3xl font-bold text-blue-800 mb-4">Sứ Mệnh Của TourZen</h2>
            <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Sứ mệnh của chúng tôi là trở thành người bạn đồng hành đáng tin cậy nhất trên mọi hành trình khám phá của bạn. TourZen không ngừng nỗ lực để mang đến những dịch vụ du lịch chất lượng cao, an toàn và độc đáo, giúp bạn tạo nên những câu chuyện tuyệt vời. Chúng tôi mong muốn truyền cảm hứng, khuyến khích mọi người bước ra khỏi vùng an toàn, khám phá những nền văn hóa mới và trân trọng vẻ đẹp của hành tinh chúng ta.
            </p>
        </div>

        {/* Why Choose Us Section */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800">Tại Sao Chọn TourZen?</h2>
            <p className="mt-2 text-gray-500">Những giá trị cốt lõi làm nên sự khác biệt của chúng tôi.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="bg-blue-600 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5">
                    {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}