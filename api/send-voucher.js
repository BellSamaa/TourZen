// api/send-voucher.js
import { Resend } from 'resend';
import VoucherEmail from '../src/emails/VoucherEmail.js';

// ✅ Dùng biến môi trường
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, promo } = req.body;

    if (!email || !promo) {
      return res.status(400).json({ error: 'Email and promo data are required.' });
    }

    const emailHtml = VoucherEmail({
      userEmail: email,
      voucherCode: promo.voucherCode,
      discountPercent: promo.discountPercent,
      promoTitle: promo.title,
      expiryDate: "31/12/2025"
    });

    const { data, error } = await resend.emails.send({
      from: 'TourZen <onboarding@resend.dev>',
      to: [email],
      subject: `🎁 Voucher giảm giá ${promo.discountPercent}% từ TourZen!`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(400).json({ error: 'Failed to send email.', details: error.message });
    }

    res.status(200).json({ message: 'Email sent successfully!', data });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
