// api/sendEmail.js
import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const resend = new Resend(process.env.VITE_RESEND_API_KEY);
  const { to, subject, html } = req.body;

  try {
    await resend.emails.send({
      from: "TourZen <no-reply@tourzen.vn>",
      to,
      subject,
      html,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
}
