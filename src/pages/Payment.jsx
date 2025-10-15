// src/pages/Payment.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserFriends, FaMapMarkerAlt, FaCreditCard, FaShuttleVan, FaUsers } from "react-icons/fa";
import { IoIosMail, IoIosCall } from "react-icons/io";

// --- Helper Components ---
const InfoInput = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
        <input {...props} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
);

// --- Main Payment Component ---
export default function Payment() {
    const navigate = useNavigate();
    const { items: cartItems, clearCart, total } = useCart();

    // --- State ---
    const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", address: "" });
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("direct");
    const [selectedBranch, setSelectedBranch] = useState("Số 123, Đường ABC, Quận Hoàn Kiếm, Hà Nội");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [useShuttle, setUseShuttle] = useState(false);
    const [shuttleAddress, setShuttleAddress] = useState("");
    
    // --- Constants ---
    const shuttlePrice = 400000;
    const discount = 800000;
    const formatCurrency = (num) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);

    // --- Memoized Calculations from Cart Data ---
    const totalPassengers = useMemo(() => 
        cartItems.reduce((sum, item) => sum + (item.adults || 0) + (item.children || 0) + (item.infants || 0), 0)
    , [cartItems]);
    
    const finalTotal = useMemo(() => 
        total + (useShuttle ? shuttlePrice : 0) - discount
    , [total, useShuttle]);

    const paymentDeadline = useMemo(() => {
        if (cartItems.length === 0) return new Date();
        const earliestDate = cartItems
            .map(item => item.departureDates?.[0])
            .filter(Boolean)
            .map(dateStr => new Date(dateStr))
            .sort((a, b) => a - b)[0] || new Date();
        earliestDate.setDate(earliestDate.getDate() - 7);
        return earliestDate;
    }, [cartItems]);

    const formattedDeadline = paymentDeadline.toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // --- Handlers ---
    const handleInputChange = (e, setState) => { setState(prev => ({ ...prev, [e.target.name]: e.target.value })); };
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

        const tour_details_html = `<ul>${cartItems.map(item => 
            `<li><b>${item.title}</b> (${item.adults} NL, ${item.children || 0} TE, ${item.infants || 0} EB)</li>`
        ).join('')}</ul>`;

        const templateParams = {
            customer_name: contactInfo.name,
            customer_email: contactInfo.email,
            customer_phone: contactInfo.phone,
            tour_details: tour_details_html,
            total_passengers: totalPassengers,
            shuttle_service: useShuttle ? `Có, đón tại: ${shuttleAddress}` : "Không sử dụng",
            total_amount: formatCurrency(finalTotal),
            notes: notes || "Không có",
        };

        try {
            if (paymentMethod === 'direct') {
                await emailjs.send('service_8w8xy0f', 'template_yqexxe9', { ...templateParams, branch_address: selectedBranch, payment_deadline: formattedDeadline }, 'mXugIgN4N-oD4WVZZ');
            } else { // VNPay
                await emailjs.send('service_8w8xy0f', 'template_lph7t7t', templateParams, 'mXugIgN4N-oD4WVZZ');
            }
            clearCart();
            navigate("/payment-success", { state: { method: paymentMethod, branch: selectedBranch, deadline: formattedDeadline } });
        } catch (error) {
            console.error("Lỗi khi gửi email:", error);
            const errorMessage = error.text || "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
            showNotification(errorMessage);
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
                    <h1 className="text-3xl font-bold text-blue-800">XÁC NHẬN ĐẶT TOUR</h1>
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
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><FaShuttleVan className="text-blue-500"/>DỊCH VỤ CỘNG THÊM</h2>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" checked={useShuttle} onChange={(e) => setUseShuttle(e.target.checked)} className="w-5 h-5 accent-blue-600"/>
                                    <div className="ml-4 flex-1">
                                        <p className="font-semibold text-blue-800">TourZen Xpress - Xe đưa đón riêng</p>
                                        <p className="text-sm text-gray-600">Tài xế riêng sẽ đón bạn tại nhà/sân bay.</p>
                                    </div>
                                    <span className="font-bold text-blue-600">{formatCurrency(shuttlePrice)}</span>
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
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">TÓM TẮT ĐƠN HÀNG</h2>
                            
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-4">
                                {cartItems.map(item => (
                                    <div key={item.key} className="flex gap-4 border-b pb-2 last:border-0">
                                        <img src={item.image || '/images/default.jpg'} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                                        <div>
                                            <p className="font-bold text-sm text-blue-800">{item.title}</p>
                                            <p className="text-xs text-gray-500">{`${item.adults || 0} NL, ${item.children || 0} TE, ${item.infants || 0} EB`}</p>
                                            <p className="text-sm font-semibold">{formatCurrency((item.adults * item.priceAdult) + ((item.children || 0) * item.priceChild || 0))}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 text-sm border-t pt-4">
                                <div className="flex justify-between font-semibold">
                                    <div className="flex items-center gap-2"><FaUsers/> <span>Tổng số khách</span></div>
                                    <span>{totalPassengers}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tạm tính</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                                {useShuttle && (
                                    <div className="flex justify-between">
                                        <span>Phí xe TourZen Xpress</span>
                                        <span>{formatCurrency(shuttlePrice)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-red-600">
                                    <span>Ưu đãi</span>
                                    <span>- {formatCurrency(discount)}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <span className="text-lg font-bold">Tổng cộng</span>
                                <span className="text-2xl font-bold text-red-600">{formatCurrency(finalTotal)}</span>
                            </div>
                            <div className="mt-6">
                                <label className="flex items-center">
                                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-4 h-4" />
                                    <span className="ml-2 text-sm">Tôi đã đọc và đồng ý với <a href="#" className="text-blue-600">Chính sách</a> và <a href="#" className="text-blue-600">Điều khoản</a>.</span>
                                </label>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-400 flex items-center justify-center gap-2">
                                <FaCreditCard />
                                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN THANH TOÁN'}
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

