// src/pages/Payment.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserFriends, FaMapMarkerAlt, FaMinus, FaPlus, FaCreditCard } from "react-icons/fa";
import { IoIosMail, IoIosCall } from "react-icons/io";

// --- Helper Components ---

// Component cho input có icon
const InfoInput = ({ icon, ...props }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {icon}
    </div>
    <input
      {...props}
      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// Component cho bộ đếm số lượng
const QuantityCounter = ({ label, description, value, onDecrease, onIncrease }) => (
  <div className="flex justify-between items-center">
    <div>
      <p className="font-semibold">{label}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={onDecrease} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50" disabled={value <= (label === "Người lớn" ? 1 : 0)}>
        <FaMinus size={12} />
      </button>
      <span className="font-bold text-lg w-8 text-center">{value}</span>
      <button onClick={onIncrease} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
        <FaPlus size={12} />
      </button>
    </div>
  </div>
);

// --- Main Payment Component ---

export default function Payment() {
  const navigate = useNavigate();
  const { items: cartItems, clearCart, total } = useCart();
  const tour = cartItems.length > 0 ? cartItems[0] : null; // Giả định thanh toán 1 tour mỗi lần

  // --- State Management ---
  const [step] = useState(1);
  const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", address: "" });
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [passengerDetails, setPassengerDetails] = useState([{ name: "", gender: "Nam", dob: "" }]);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("direct");
  const [selectedBranch, setSelectedBranch] = useState("Số 123, Đường ABC, Quận Hoàn Kiếm, Hà Nội");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  // --- Effects ---
  // Tự động điều chỉnh form thông tin hành khách khi số lượng người lớn thay đổi
  useEffect(() => {
    const adultCount = passengers.adults;
    const currentDetailsCount = passengerDetails.length;

    if (adultCount > currentDetailsCount) {
      const newDetails = Array(adultCount - currentDetailsCount).fill({ name: "", gender: "Nam", dob: "" });
      setPassengerDetails(prev => [...prev, ...newDetails]);
    } else if (adultCount < currentDetailsCount) {
      setPassengerDetails(prev => prev.slice(0, adultCount));
    }
  }, [passengers.adults]);

  // --- Memoized Calculations ---
  const paymentDeadline = useMemo(() => {
    if (!tour || !tour.departureDates || tour.departureDates.length === 0) {
      const today = new Date();
      today.setDate(today.getDate() + 7);
      return today;
    }
    const earliestDeparture = new Date(tour.departureDates[0]);
    earliestDeparture.setDate(earliestDeparture.getDate() - 7);
    return earliestDeparture;
  }, [tour]);

  const formattedDeadline = paymentDeadline.toLocaleDateString("vi-VN", {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // --- Handlers ---
  const handleInputChange = (e, setState) => {
    setState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePassengerCount = (type, delta) => {
    setPassengers(prev => {
      const newValue = Math.max((type === 'adults' ? 1 : 0), prev[type] + delta);
      return { ...prev, [type]: newValue };
    });
  };

  const handlePassengerDetailChange = (index, field, value) => {
    const updatedDetails = [...passengerDetails];
    updatedDetails[index][field] = value;
    setPassengerDetails(updatedDetails);
  };

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) {
      showNotification("Vui lòng điền đầy đủ thông tin liên lạc.");
      return;
    }
    if (passengerDetails.some(p => !p.name || !p.dob)) {
      showNotification("Vui lòng điền đầy đủ thông tin của tất cả hành khách.");
      return;
    }
    if (!agreedToTerms) {
      showNotification("Bạn phải đồng ý với các điều khoản và chính sách.");
      return;
    }

    setIsSubmitting(true);

    const templateParams = {
        customer_name: contactInfo.name,
        customer_email: contactInfo.email,
        customer_phone: contactInfo.phone,
        tour_title: tour.title,
        tour_location: tour.location,
        total_passengers: passengers.adults + passengers.children + passengers.infants,
        passenger_list: passengerDetails.map(p => `- ${p.name} (${p.gender}, sinh ngày ${p.dob})`).join('\n'),
        total_amount: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total),
        notes: notes || "Không có",
    };

    try {
        if (paymentMethod === 'direct') {
            await emailjs.send(
                'service_8w8xy0f', 
                'template_yqexxe9', 
                { ...templateParams, branch_address: selectedBranch, payment_deadline: formattedDeadline }, 
                'mXugIgN4N-oD4WVZZ'
            );
        } else { // VNPay
            // Trong thực tế, bạn sẽ tạo URL thanh toán ở backend và redirect.
            // Ở đây, ta giả lập thanh toán thành công và gửi email.
            await emailjs.send(
                'service_8w8xy0f',
                'template_lph7t7t',
                templateParams,
                'mXugIgN4N-oD4WVZZ'
            );
        }
        clearCart();
        navigate("/payment-success");
    } catch (error) {
        console.error("Lỗi khi gửi email:", error);
        showNotification("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!tour) {
    return (
      <div className="text-center py-20 text-xl font-semibold">
        Giỏ hàng của bạn đang trống. Vui lòng chọn một tour để thanh toán.
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar */}
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-800">ĐẶT TOUR</h1>
            <div className="flex justify-center items-center mt-4">
                {['NHẬP THÔNG TIN', 'THANH TOÁN', 'HOÀN TẤT'].map((label, index) => (
                    <React.Fragment key={label}>
                        <div className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${step > index ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300'}`}>
                                <FaUserFriends/>
                            </div>
                            <p className={`mt-2 font-semibold ${step > index ? 'text-blue-600' : 'text-gray-500'}`}>{label}</p>
                        </div>
                        {index < 2 && <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>}
                    </React.Fragment>
                ))}
            </div>
        </div>

        {/* Main Content */}
        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">THÔNG TIN LIÊN LẠC</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoInput icon={<FaUserFriends className="text-gray-400"/>} placeholder="Họ tên *" name="name" value={contactInfo.name} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                <InfoInput icon={<IoIosCall className="text-gray-400"/>} placeholder="Điện thoại *" name="phone" value={contactInfo.phone} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                <InfoInput icon={<IoIosMail className="text-gray-400"/>} placeholder="Email *" name="email" type="email" value={contactInfo.email} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                <InfoInput icon={<FaMapMarkerAlt className="text-gray-400"/>} placeholder="Địa chỉ" name="address" value={contactInfo.address} onChange={(e) => handleInputChange(e, setContactInfo)} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">HÀNH KHÁCH</h2>
                <div className="space-y-4">
                    <QuantityCounter label="Người lớn" description="Từ 12 tuổi" value={passengers.adults} onDecrease={() => handlePassengerCount('adults', -1)} onIncrease={() => handlePassengerCount('adults', 1)} />
                    <QuantityCounter label="Trẻ em" description="Từ 2 - 11 tuổi" value={passengers.children} onDecrease={() => handlePassengerCount('children', -1)} onIncrease={() => handlePassengerCount('children', 1)} />
                    <QuantityCounter label="Em bé" description="Dưới 2 tuổi" value={passengers.infants} onDecrease={() => handlePassengerCount('infants', -1)} onIncrease={() => handlePassengerCount('infants', 1)} />
                </div>
            </div>

             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">THÔNG TIN HÀNH KHÁCH</h2>
                {passengerDetails.map((p, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b py-4 last:border-0">
                        <p className="font-semibold md:col-span-1">Người lớn {index + 1}</p>
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <input placeholder="Họ tên *" value={p.name} onChange={(e) => handlePassengerDetailChange(index, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required/>
                            <select value={p.gender} onChange={(e) => handlePassengerDetailChange(index, 'gender', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option>Nam</option>
                                <option>Nữ</option>
                            </select>
                            <input type="date" value={p.dob} onChange={(e) => handlePassengerDetailChange(index, 'dob', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required/>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">GHI CHÚ</h2>
                <textarea placeholder="Quý khách có ghi chú gì lưu ý, hãy nói với chúng tôi" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md"></textarea>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">PHƯƠNG THỨC THANH TOÁN</h2>
                <div className="space-y-4">
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'direct' ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}>
                        <input type="radio" name="paymentMethod" value="direct" checked={paymentMethod === 'direct'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5"/>
                        <div className="ml-4">
                            <p className="font-semibold">Thanh toán trực tiếp</p>
                            <p className="text-sm text-gray-600">Đặt lịch hẹn và thanh toán tại văn phòng của chúng tôi.</p>
                        </div>
                    </label>
                    <AnimatePresence>
                    {paymentMethod === 'direct' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pl-8 space-y-2">
                             <p className="text-sm font-semibold">Vui lòng thanh toán trước: <span className="text-red-600 font-bold">{formattedDeadline}</span></p>
                             <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option>Số 123, Đường ABC, Quận Hoàn Kiếm, Hà Nội</option>
                                <option>Số 456, Đường XYZ, Quận 1, Hồ Chí Minh</option>
                                <option>Số 789, Đường UVW, Quận Hải Châu, Đà Nẵng</option>
                             </select>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'vnpay' ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}>
                        <input type="radio" name="paymentMethod" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5"/>
                        <div className="ml-4 flex items-center">
                            <p className="font-semibold mr-2">Thanh toán qua VNPay</p>
                            <img src="/vnpay_logo.png" alt="VNPay" className="h-8"/>
                        </div>
                    </label>
                </div>
            </div>

          </div>

          {/* Right Column */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">TÓM TẮT CHUYẾN ĐI</h2>
              <img src={tour.image || '/images/default.jpg'} alt={tour.title} className="rounded-lg mb-4 w-full h-40 object-cover"/>
              <h3 className="font-bold text-blue-800">{tour.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{tour.location}</p>
              
              <div className="space-y-2 text-sm border-t pt-4">
                  <div className="flex justify-between"><span>Người lớn</span><span>{passengers.adults} x {new Intl.NumberFormat("vi-VN").format(tour.priceAdult)} ₫</span></div>
                  {passengers.children > 0 && <div className="flex justify-between"><span>Trẻ em</span><span>{passengers.children} x {new Intl.NumberFormat("vi-VN").format(tour.priceChild)} ₫</span></div>}
                  {passengers.infants > 0 && <div className="flex justify-between"><span>Em bé</span><span>{passengers.infants} x {new Intl.NumberFormat("vi-VN").format(tour.priceInfant)} ₫</span></div>}
                  <div className="flex justify-between text-red-600">
                    <span>Ưu đãi giờ chót</span>
                    <span>- {new Intl.NumberFormat("vi-VN").format(800000)} ₫</span>
                  </div>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="text-lg font-bold">Tổng tiền</span>
                <span className="text-2xl font-bold text-red-600">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total - 800000)}</span>
              </div>
              
               <div className="mt-6">
                    <label className="flex items-center">
                        <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-4 h-4" />
                        <span className="ml-2 text-sm">Tôi đã đọc và đồng ý với <a href="#" className="text-blue-600">Chính sách</a> và <a href="#" className="text-blue-600">Điều khoản</a>.</span>
                    </label>
                </div>

              <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-400 flex items-center justify-center gap-2">
                <FaCreditCard/>
                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN'}
              </button>
            </div>
          </aside>
        </form>
      </div>

      {/* Notification Toast */}
       <AnimatePresence>
            {notification.message && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.5 }}
                    className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
                >
                    {notification.message}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}