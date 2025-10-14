// src/pages/PromotionPage.jsx
import React, { useState } from 'react';
import PromotionCard from '../components/PromotionCard.jsx';
import VoucherModal from '../components/VoucherModal.jsx';

// Mở rộng dữ liệu mẫu
const promotionsData = {
  events: [
    { id: 1, title: 'Đại Lễ 2/9', description: 'Vi vu không lo về giá, giảm đến 30% tour toàn quốc.', image: 'https://images.unsplash.com/photo-1597093278291-a205a1e7a36f?q=80&w=2070', tag: 'Lễ 2/9', timeLimit: 'Còn 3 ngày', voucherCode: 'LEQUOCKHANH', discountPercent: 30 },
    { id: 2, title: 'Chào hè rực rỡ', description: 'Ưu đãi đặc biệt cho các tour biển đảo. Tặng voucher lặn biển.', image: 'https://images.unsplash.com/photo-1507525428034-b723a996f6ea?q=80&w=2070', tag: 'Tour hè', timeLimit: 'Đến 31/08', voucherCode: 'HEVUI', discountPercent: 20, quantityLimit: true },
  ],
  regions: [
    { id: 3, title: 'Khám phá Miền Trung', description: 'Hành trình di sản Đà Nẵng - Huế - Hội An giảm ngay 25%.', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070', tag: 'Miền Trung', timeLimit: 'Vô thời hạn', voucherCode: 'DISANMT', discountPercent: 25 },
    { id: 4, title: 'Tây Bắc Mùa Lúa Chín', description: 'Săn mây Tà Xùa, khám phá Mù Cang Chải với giá siêu hấp dẫn.', image: 'https://images.unsplash.com/photo-1627993322198-281b6ac5a42b?q=80&w=2072', tag: 'Miền Bắc', timeLimit: 'Đến 30/10', voucherCode: 'MUAVANG', discountPercent: 15, quantityLimit: true },
  ],
  thematic: [
      { id: 5, title: 'Một vòng Việt Nam', description: 'Hành trình xuyên Việt 14 ngày, khám phá mọi miền Tổ quốc.', image: 'https://images.unsplash.com/photo-1543973156-3804b81a7351?q=80&w=2070', tag: 'Xuyên Việt', timeLimit: 'Ưu đãi tháng này', voucherCode: 'VIETNAMOI', discountPercent: 10 },
  ]
};

export default function PromotionPage() {
  const [selectedPromo, setSelectedPromo] = useState(null);

  const handleClaimVoucher = (promo) => {
    setSelectedPromo(promo);
  };

  const handleCloseModal = () => {
    setSelectedPromo(null);
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-white mb-2">Săn Ưu đãi, Vi vu khắp chốn</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">Các chương trình khuyến mãi hấp dẫn nhất đang chờ bạn!</p>
        </div>
        
        {/* Ưu đãi theo dịp lễ */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-6">Ưu đãi theo Dịp lễ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {promotionsData.events.map(promo => (
              <PromotionCard key={promo.id} promo={promo} onClaim={handleClaimVoucher} />
            ))}
          </div>
        </section>

        {/* Ưu đãi theo vùng miền */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-6">Ưu đãi theo Vùng miền</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {promotionsData.regions.map(promo => (
              <PromotionCard key={promo.id} promo={promo} onClaim={handleClaimVoucher} />
            ))}
          </div>
        </section>

        {/* Ưu đãi đặc biệt */}
        <section>
          <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-6">Ưu đãi Đặc biệt</h2>
          <div>
            {promotionsData.thematic.map(promo => (
              <PromotionCard key={promo.id} promo={promo} onClaim={handleClaimVoucher} />
            ))}
          </div>
        </section>
      </div>

      {/* Modal hiển thị khi săn voucher */}
      <VoucherModal promo={selectedPromo} onClose={handleCloseModal} />
    </div>
  );
}