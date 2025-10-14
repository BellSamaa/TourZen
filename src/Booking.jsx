// inside your booking submit handler (async)
import axios from "axios";

async function handleSubmit(e) {
  e.preventDefault();
  // gather booking info, compute total in VND
  const total = tour.price * qty; // number in VND
  try {
    const resp = await axios.post("http://localhost:3001/api/vnpay/create_payment", {
      amount: total,
      orderInfo: `Thanh toan ${tour.title} - ${customerName}`,
      orderType: "tour",
      bankCode: "", // optional
      locale: "vn",
      // returnUrl optional: override default
      // returnUrl: "http://localhost:5173/payment/success"
    });
    if (resp.data && resp.data.paymentUrl) {
      // store draft booking in localStorage if want
      localStorage.setItem("lastBooking", JSON.stringify({ id: resp.data.orderId, tourId: tour.id, total }));
      // redirect browser to VNPay sandbox url
      window.location.href = resp.data.paymentUrl;
    } else {
      // fallback simulation: mark booking locally as paid and navigate to success
      // ...
    }
  } catch(err) {
    console.error(err);
    alert("Lỗi tạo payment. Kiểm tra server.");
  }
}
