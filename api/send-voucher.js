// src/pages/api/send-voucher.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, phone, email, promo } = req.body;

    if (!name || !phone || !email || !promo) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // Gửi email
    const message = {
      from: "no-reply@yourdomain.com", // thay bằng email đã verified với Resend
      to: email,
      subject: `Voucher ${promo.title} của bạn đã sẵn sàng!`,
      html: `
        <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
          <h2>Xin chào ${name},</h2>
          <p>Bạn vừa nhận voucher cho chương trình: <strong>${promo.title}</strong>.</p>
          <p>Mã voucher của bạn là:</p>
          <p style="font-size: 24px; font-weight: bold; background: #f0f0f0; padding: 10px; display: inline-block;">${promo.voucherCode}</p>
          <p>SĐT của bạn: ${phone}</p>
          <p>Voucher có giá trị giảm ${promo.discountPercent}% cho các tour liên quan.</p>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
        </div>
      `,
    };

    await resend.emails.send(message);

    return res.status(200).json({ message: "Voucher đã gửi thành công!" });
  } catch (error) {
    console.error("Lỗi gửi voucher:", error);
    return res.status(500).json({ error: "Gửi thất bại, thử lại sau." });
  }
}
