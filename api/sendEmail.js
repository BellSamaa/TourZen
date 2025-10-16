import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Thiếu dữ liệu cần thiết' });
  }

  try {
    const data = await resend.emails.send({
      from: 'TourZen <no-reply@tourzen.vn>', // địa chỉ domain verified trong Resend
      to,
      subject,
      html,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: error.message });
  }
}
