// api/send-voucher.js
import { Resend } from "resend";
import VoucherEmail from "../src/emails/VoucherEmail.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, phone, email, promo } = req.body;

  if (!name || !phone || !email || !promo) {
    return res.status(400).json({ error: "Name, phone, email and promo data are required." });
  }

  try {
    const emailHtml = VoucherEmail({
      userName: name,
      userPhone: phone,
      userEmail: email,
      voucherCode: promo.voucherCode,
      discountPercent: promo.discountPercent,
      promoTitle: promo.title,
      expiryDate: "31/12/2025",
    });

    const data = await resend.emails.send({
      from: "TourZen <onboarding@resend.dev>",
      to: [email],
      subject: `🎁 Voucher giảm giá ${promo.discountPercent}% từ TourZen!`,
      html: emailHtml,
    });

    return res.status(200).json({ message: "Email sent successfully!", data });
  } catch (error) {
    console.error("Resend send error:", error);
    return res.status(500).json({
      error: "Failed to send email via Resend",
      details: error.message || error.toString(),
    });
  }
}
