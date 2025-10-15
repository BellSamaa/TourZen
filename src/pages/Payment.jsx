// src/pages/Payment.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserFriends, FaMapMarkerAlt, FaMinus, FaPlus, FaCreditCard, FaShuttleVan } from "react-icons/fa";
import { IoIosMail, IoIosCall } from "react-icons/io";

// --- Helper Components ---
const InfoInput = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
        <input {...props} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
);

const QuantityCounter = ({ label, description, value, onDecrease, onIncrease }) => (
    <div className="flex justify-between items-center">
        <div>
            <p className="font-semibold">{label}</p>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex items-center gap-3">
            <button type="button" onClick={onDecrease} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50" disabled={value <= (label === "Người lớn" ? 1 : 0)}><FaMinus size={12} /></button>
            <span className="font-bold text-lg w-8 text-center">{value}</span>
            <button type="button" onClick={onIncrease} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"><FaPlus size={12} /></button>
        </div>
    </div>
);

// --- Main Payment Component ---
export default function Payment() {
    const navigate = useNavigate();
    const { items: cartItems, clearCart, total } = useCart();
    const tour = cartItems.length > 0 ? cartItems[0] : null;

    const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", address: "" });
    const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("direct");
    const [selectedBranch, setSelectedBranch] = useState("Số 123, Đường ABC, Quận Hoàn Kiếm, Hà Nội");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [useShuttle, setUseShuttle] = useState(false);
    const [shuttleAddress, setShuttleAddress] = useState("");
    const shuttlePrice = 400000;
    
    // ✅ FIX: Di chuyển biến discount ra ngoài để toàn bộ component có thể truy cập
    const discount = 800000; 

    const paymentDeadline = useMemo(() => {
        if (!tour || !tour.departureDates || !tour.departureDates.length === 0) {
            const today = new Date(); today.setDate(today.getDate() + 7); return today;
        }
        const earliestDeparture = new Date(tour.departureDates[0]);
        earliestDeparture.setDate(earliestDeparture.getDate() - 7);
        return earliestDeparture;
    }, [tour]);

    const formattedDeadline = paymentDeadline.toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const displayTotal = useMemo(() => {
        const adultsTotal = passengers.adults * (tour?.priceAdult || 0);
        const childrenTotal = passengers.children * (tour?.priceChild || 0);
        const infantsTotal = 0; 
        const shuttleFee = useShuttle ? shuttlePrice : 0;
        return adultsTotal + childrenTotal + infantsTotal - discount + shuttleFee;
    }, [passengers, tour, useShuttle, discount, shuttlePrice]);

    const handleInputChange = (e, setState) => { setState(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handlePassengerCount = (type, delta) => { setPassengers(prev => { const newValue = Math.max((type === 'adults' ? 1 : 0), prev[type] + delta); return { ...prev, [type]: newValue }; }); };
    const showNotification = (message, type = "error") => { setNotification({ message, type }); setTimeout(() => setNotification({ message: "", type: "" }), 4000); };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) {
            showNotification("Vui lòng điền đầy đủ thông tin liên lạc."); return;
        }
        if (useShuttle && !shuttleAddress) {
            showNotification("Vui lòng nhập địa chỉ đưa đón của bạn."); return;
        }
        if (!agreedToTerms) {
            showNotification("Bạn phải đồng ý với các điều khoản và chính sách."); return;
        }

        setIsSubmitting(true);
        const templateParams = {
            customer_name: contactInfo.name,
            customer_email: contactInfo.email,
            customer_phone: contactInfo.phone,
            tour_title: cartItems.map(i => i.title).join(', '),
            total_passengers: passengers.adults + passengers.children + passengers.infants,
            shuttle_service: useShuttle ? `Có, đón tại: ${shuttleAddress}` : "Không sử dụng",
            total_amount: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total + (useShuttle ? shuttlePrice : 0) - discount),
            notes: notes || "Không có",
        };

        try {
            if (paymentMethod === 'direct') {
                await emailjs.send('service_8w8xy0f', 'template_yqexxe9', { ...templateParams, branch_address: selectedBranch, payment_deadline: formattedDeadline }, 'mXugIgN4N-oD4WVZZ');
                clearCart();
                navigate("/payment-success", { state: { method: 'direct', branch: selectedBranch, deadline: formattedDeadline } });
            } else { // VNPay
                await emailjs.send('service_8w8xy0f', 'template_lph7t7t', templateParams, 'mXugIgN4N-oD4WVZZ');
                clearCart();
                navigate("/payment-success", { state: { method: 'vnpay' } });
            }
        } catch (error) {
            console.error("Lỗi khi gửi email:", error);
            showNotification("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) {
        return <div className="text-center py-20 text-xl font-semibold">Giỏ hàng của bạn đang trống.</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-800">ĐẶT TOUR</h1>
                </div>
                <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">THÔNG TIN LIÊN LẠC</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoInput icon={<FaUserFriends />} placeholder="Họ tên *" name="name" value={contactInfo.name} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                <InfoInput icon={<IoIosCall />} placeholder="Điện thoại *" name="phone" value={contactInfo.phone} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                <InfoInput icon={<IoIosMail />} placeholder="Email *" name="email" type="email" value={contactInfo.email} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                <InfoInput icon={<FaMapMarkerAlt />} placeholder="Địa chỉ" name="address" value={contactInfo.address} onChange={(e) => handleInputChange(e, setContactInfo)} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">SỐ LƯỢNG HÀNH KHÁCH</h2>
                            <div className="space-y-4">
                                <QuantityCounter label="Người lớn" description="Trên 1m4" value={passengers.adults} onDecrease={() => handlePassengerCount('adults', -1)} onIncrease={() => handlePassengerCount('adults', 1)} />
                                <QuantityCounter label="Trẻ em" description="Dưới 1m4" value={passengers.children} onDecrease={() => handlePassengerCount('children', -1)} onIncrease={() => handlePassengerCount('children', 1)} />
                                <QuantityCounter label="Em bé" description="Dưới 2 tuổi (Miễn phí)" value={passengers.infants} onDecrease={() => handlePassengerCount('infants', -1)} onIncrease={() => handlePassengerCount('infants', 1)} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><FaShuttleVan className="text-blue-500"/>DỊCH VỤ CỘNG THÊM</h2>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" checked={useShuttle} onChange={(e) => setUseShuttle(e.target.checked)} className="w-5 h-5 accent-blue-600"/>
                                    <div className="ml-4 flex-1">
                                        <p className="font-semibold text-blue-800">TourZen Xpress - Xe đưa đón riêng</p>
                                        <p className="text-sm text-gray-600">Tài xế riêng sẽ đón bạn tại nhà/sân bay.</p>
                                    </div>
                                    <span className="font-bold text-blue-600">{new Intl.NumberFormat("vi-VN").format(shuttlePrice)} ₫</span>
                                </label>
                                <AnimatePresence>
                                    {useShuttle && (
                                        <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '16px' }} exit={{ opacity: 0, height: 0, marginTop: 0 }}>
                                            <InfoInput icon={<FaMapMarkerAlt />} placeholder="Nhập địa chỉ cần đón *" value={shuttleAddress} onChange={(e) => setShuttleAddress(e.target.value)} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                          <h2 className="text-xl font-bold mb-4">GHI CHÚ</h2>
                          <textarea placeholder="Ghi chú thêm (nếu có)" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md"></textarea>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">PHƯƠNG THỨC THANH TOÁN</h2>
                            <div className="space-y-4">
                                <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'direct' ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}>
                                  <input type="radio" name="paymentMethod" value="direct" checked={paymentMethod === 'direct'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5" />
                                  <div className="ml-4">
                                    <p className="font-semibold">Thanh toán trực tiếp</p>
                                    <p className="text-sm text-gray-600">Đặt lịch hẹn và thanh toán tại văn phòng.</p>
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
                                  <input type="radio" name="paymentMethod" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5" />
                                  <div className="ml-4 flex items-center">
                                    <p className="font-semibold mr-2">Thanh toán qua VNPay</p>
                                    <img src="/vnpay_logo.png" alt="VNPay" className="h-8" />
                                  </div>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <aside className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">TÓM TẮT CHUYẾN ĐI</h2>
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-4">
                                {cartItems.map(item => (
                                    <div key={item.key} className="flex gap-4 border-b pb-2 last:border-0">
                                        <img src={item.image || '/images/default.jpg'} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                                        <div>
                                            <p className="font-bold text-sm text-blue-800">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.location}</p>
                                            <p className="text-sm font-semibold">{new Intl.NumberFormat("vi-VN").format((item.adults * item.priceAdult) + ((item.children || 0) * item.priceChild || 0))} ₫</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 text-sm border-t pt-4">
                                <div className="flex justify-between">
                                    <span>Tạm tính</span>
                                    <span>{new Intl.NumberFormat("vi-VN").format(total)} ₫</span>
                                </div>
                                {useShuttle && (
                                    <div className="flex justify-between">
                                        <span>Phí xe TourZen Xpress</span>
                                        <span>{new Intl.NumberFormat("vi-VN").format(shuttlePrice)} ₫</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-red-600">
                                    <span>Ưu đãi</span>
                                    <span>- {new Intl.NumberFormat("vi-VN").format(discount)} ₫</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <span className="text-lg font-bold">Tổng tiền</span>
                                <span className="text-2xl font-bold text-red-600">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total + (useShuttle ? shuttlePrice : 0) - discount)}</span>
                            </div>
                            <div className="mt-6">
                                <label className="flex items-center">
                                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-4 h-4" />
                                    <span className="ml-2 text-sm">Tôi đã đọc và đồng ý với <a href="#" className="text-blue-600">Chính sách</a> và <a href="#" className="text-blue-600">Điều khoản</a>.</span>
                                </label>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-400 flex items-center justify-center gap-2">
                                <FaCreditCard />
                                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN'}
                            </button>
                        </div>
                    </aside>
                </form>
            </div>
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
