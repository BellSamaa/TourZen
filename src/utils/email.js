// src/utils/email.js
import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_8w8xy0f";
const TEMPLATE_ID = "template_lph7t7t";
const PUBLIC_KEY = "mXugIgN4N-oD4WVZZ";

export async function sendBookingEmail({ name, email, tour, date, location, total }) {
  try {
    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        name,
        email,
        tour,
        date,
        location,
        total,
      },
      PUBLIC_KEY
    );
    return { success: true, result };
  } catch (error) {
    console.error("EmailJS error:", error);
    return { success: false, error };
  }
}
