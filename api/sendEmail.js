import { Resend } from 'resend';
<<<<<<< HEAD

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
=======

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { to, subject, html } = req.body;

    const resend = new Resend(process.env.VITE_RESEND_API_KEY);

    const data = await resend.emails.send({
      from: 'TourZen <no-reply@tourzen.app>', // có thể thay bằng domain riêng
>>>>>>> 01fbf6d55201acd14db181133e6b4788f32b80ad
      to,
      subject,
      html,
    });

<<<<<<< HEAD
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: error.message });
=======
    return res.status(200).json({ message: 'Email sent successfully', data });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ message: 'Failed to send email', error });
>>>>>>> 01fbf6d55201acd14db181133e6b4788f32b80ad
  }
}
