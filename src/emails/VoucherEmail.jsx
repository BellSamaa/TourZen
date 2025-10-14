// src/emails/VoucherEmail.jsx
import React from 'react';
import {
  Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text, Tailwind
} from '@react-email/components';

export default function VoucherEmail({
  userEmail = "example@email.com",
  voucherCode = "HEVUI25",
  discountPercent = 25,
  promoTitle = "Chào hè rực rỡ",
  expiryDate = "31/10/2025"
}) {
  const brandLogoUrl = "https://your-domain.com/logo.png"; // Thay bằng link logo của bạn

  return (
    <Html>
      <Head />
      <Preview>Chúc mừng! Bạn đã nhận được voucher giảm giá từ TourZen.</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white my-12 mx-auto p-8 rounded-lg shadow-md max-w-2xl">
            <Section className="text-center">
              <Img src={brandLogoUrl} width="120" alt="TourZen Logo" className="mx-auto" />
              <Heading className="text-3xl font-bold text-gray-800 mt-6">Săn Voucher Thành Công!</Heading>
              <Text className="text-gray-600 text-lg">
                Xin chào {userEmail},
              </Text>
              <Text className="text-gray-600">
                Cảm ơn bạn đã tham gia chương trình khuyến mãi "{promoTitle}". TourZen xin gửi tặng bạn mã giảm giá độc quyền.
              </Text>
            </Section>

            <Section className="text-center my-8 bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-6">
              <Text className="text-gray-500 text-sm">Mã giảm giá của bạn:</Text>
              <Text className="text-4xl font-extrabold text-blue-600 tracking-widest">{voucherCode}</Text>
              <Text className="text-lg font-semibold">Giảm {discountPercent}% cho các tour trong chương trình</Text>
            </Section>

            <Section className="text-center">
              <Button
                href="https://your-domain.com/tours" // Thay bằng link trang tour của bạn
                className="bg-orange-500 text-white font-bold py-4 px-8 rounded-lg text-base"
              >
                Sử dụng ngay
              </Button>
            </Section>

            <Section className="mt-8 text-center text-gray-500 text-sm">
              <Text>Voucher có hiệu lực đến hết ngày {expiryDate}.</Text>
              <Text>Mọi thắc mắc vui lòng liên hệ bộ phận hỗ trợ của TourZen.</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}