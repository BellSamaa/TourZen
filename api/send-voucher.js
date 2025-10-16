import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { to, subject, html } = req.body;
  if (!to || !subject || !html) {
    return res.status(400).json({ message: "Thiếu dữ liệu gửi email." });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "TourZen <noreply@tourzen.vn>",
      to, // ✅ dùng biến `to` truyền từ client
      subject,
      html,
    });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Send email error:", error);
    return res.status(500).json({ message: "Send email failed", error: error.message });
  }
}
