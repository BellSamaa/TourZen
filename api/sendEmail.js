import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { to, subject, html } = req.body;

    const resend = new Resend(process.env.VITE_RESEND_API_KEY);

    const data = await resend.emails.send({
      from: 'TourZen <no-reply@tourzen.app>', // có thể thay bằng domain riêng
      to,
      subject,
      html,
    });

    return res.status(200).json({ message: 'Email sent successfully', data });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ message: 'Failed to send email', error });
  }
}
