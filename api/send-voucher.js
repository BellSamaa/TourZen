// pages/api/sendEmail.js
import { Resend } from "resend";

/**
 * Expected body JSON:
 * {
 *   to: "customer@example.com",
 *   subject: "Xác nhận đặt tour",
 *   html: "<h1>...</h1>",
 *   text?: "plain text fallback"
 * }
 */

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { to, subject, html, text } = req.body ?? {};

    // Basic validation
    if (!to || !subject || !html) {
      return res.status(400).json({ ok: false, message: "Missing required fields: to, subject, html" });
    }

    // Very basic email format check (improve if needed)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return res.status(400).json({ ok: false, message: "Invalid recipient email" });
    }

    // Send email via Resend
    const sendResult = await resend.emails.send({
      from: process.env.EMAIL_FROM || "TourZen <no-reply@tourzen.vn>", // must be a verified domain/address
      to,
      subject,
      html,
      // Provide a text fallback (either provided or stripped from html)
      text: text || htmlToTextFallback(html),
    });

    // Optional: return the resend response id / status
    return res.status(200).json({ ok: true, data: sendResult });
  } catch (error) {
    console.error("[/api/sendEmail] error:", error);
    // Avoid leaking internal details to client; send message and possibly code
    return res.status(500).json({
      ok: false,
      message: "Failed to send email",
      error: (error && error.message) || "unknown_error",
    });
  }
}

/** Simple HTML -> plain text fallback */
function htmlToTextFallback(html) {
  // naive approach: remove tags, decode entities minimally
  if (!html) return "";
  // Remove script/style blocks
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  // Replace <br>, <p>, <li> with newlines
  text = text.replace(/<(br|BR)\s*\/?>/g, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/li>/gi, "\n");
  // Strip remaining tags
  text = text.replace(/<\/?[^>]+(>|$)/g, "");
  // Collapse multiple spaces/newlines
  text = text.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return text;
}
