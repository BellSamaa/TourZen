// api/sendEmail.js

import { Resend } from 'resend';

// 1. Khởi tạo Resend ở ngoài handler để tối ưu hiệu năng
//    Sử dụng process.env.RESEND_API_KEY (tiêu chuẩn hơn cho backend)
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Chỉ cho phép phương thức POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html } = req.body;

    // 2. Thêm kiểm tra dữ liệu đầu vào
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Thiếu các trường to, subject, hoặc html' });
    }

    // 3. Gửi email
    const { data, error } = await resend.emails.send({
      // ⬇️ QUAN TRỌNG: Hãy đảm bảo bạn dùng đúng domain đã xác thực với Resend
      //    Ví dụ: 'TourZen <booking@tourzen.vn>'
      from: 'TourZen <onboarding@resend.dev>',
      to: [to], // API của Resend khuyến khích 'to' là một mảng
      subject: subject,
      html: html,
    });

    // 4. Xử lý lỗi từ Resend
    if (error) {
      console.error('Lỗi từ Resend:', error);
      // Trả về lỗi chi tiết hơn từ Resend
      return res.status(400).json({ error: `Không thể gửi email: ${error.message}` });
    }

    // 5. Trả về thành công
    return res.status(200).json({ success: true, data });

  } catch (error) {
    // Xử lý các lỗi server khác
    console.error('Lỗi server nội bộ:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra trên máy chủ' });
  }
}