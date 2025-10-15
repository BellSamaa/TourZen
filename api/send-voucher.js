import { Resend } from "resend";

// Khởi tạo Resend với API Key từ file .env
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
    const { data, error } = await resend.emails.send({
      // ✅ SỬA Ở ĐÂY: Dùng email mặc định của Resend để test
      // Khi deploy thật, bạn cần thay bằng email đã xác thực với Resend (vd: voucher@tourzen.com)
      from: 'TourZen <onboarding@resend.dev>', 
      to: [email],
      subject: `Voucher ${promo.title} của bạn đã sẵn sàng!`,
      // Sử dụng React component để tạo email cho đẹp hơn (tùy chọn)
      // react: EmailTemplate({ name: name, promo: promo }),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Xin chào ${name},</h2>
          <p>Cảm ơn bạn đã quan tâm đến chương trình khuyến mãi: <strong>${promo.title}</strong>.</p>
          <p>TourZen gửi tặng bạn mã voucher dưới đây:</p>
          <div style="text-align: center; margin: 20px 0;">
            <p style="font-size: 28px; font-weight: bold; background: #e0f2fe; color: #0c4a6e; padding: 15px 25px; display: inline-block; border-radius: 8px; border: 2px dashed #7dd3fc;">
              ${promo.voucherCode}
            </p>
          </div>
          <p>Voucher có giá trị giảm <strong>${promo.discountPercent}%</strong> cho các tour liên quan.</p>
          <p>Chúc bạn có những chuyến đi tuyệt vời cùng TourZen!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 0.8em; color: #777;">Email này được gửi tự động. Vui lòng không trả lời.</p>
        </div>
      `,
    });

    if (error) {
        return res.status(400).json(error);
    }

    return res.status(200).json({ message: "Voucher đã gửi thành công!", data });
  } catch (error) {
    console.error("Lỗi gửi voucher:", error);
    return res.status(500).json({ error: "Gửi thất bại, thử lại sau." });
  }
}