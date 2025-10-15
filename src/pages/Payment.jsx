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

    const paymentDeadline = useMemo(() => {
        if (!tour || !tour.departureDates || tour.departureDates.length === 0) {
            const today = new Date(); today.setDate(today.getDate() + 7); return today;
        }
        const earliestDeparture = new Date(tour.departureDates[0]);
        earliestDeparture.setDate(earliestDeparture.getDate() - 7);
        return earliestDeparture;
    }, [tour]);

    const formattedDeadline = paymentDeadline.toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const displayTotal = useMemo(() => {
        if (!tour) return 0;
        const adultsTotal = passengers.adults * (tour.priceAdult || 0);
        const childrenTotal = passengers.children * (tour.priceChild || 0);
        // ✅ CẬP NHẬT: Em bé không tính tiền tour
        const infantsTotal = 0; 
        const discount = 800000;
        const shuttleFee = useShuttle ? shuttlePrice : 0;
        return adultsTotal + childrenTotal + infantsTotal - discount + shuttleFee;
    }, [passengers, tour, useShuttle]);

    const handleInputChange = (e, setState) => { setState(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handlePassengerCount = (type, delta) => { setPassengers(prev => { const newValue = Math.max((type === 'adults' ? 1 : 0), prev[type] + delta); return { ...prev, [type]: newValue }; }); };
    const showNotification = (message, type = "error") => { setNotification({ message, type }); setTimeout(() => setNotification({ message: "", type: "" }), 4000); };

    const handleCheckout = async (e) => {
        e.preventDefault();
        // ... (Validation checks)
        setIsSubmitting(true);
        const templateParams = {
            customer_name: contactInfo.name,
            customer_email: contactInfo.email,
            // ... (các params khác)
        };
        try {
            // ... (Logic gửi email)
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
                    {/* Progress Bar ... */}
                </div>
                <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* THÔNG TIN LIÊN LẠC */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">THÔNG TIN LIÊN LẠC</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoInput icon={<FaUserFriends />} placeholder="Họ tên *" name="name" value={contactInfo.name} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                <InfoInput icon={<IoIosCall />} placeholder="Điện thoại *" name="phone" value={contactInfo.phone} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                <InfoInput icon={<IoIosMail />} placeholder="Email *" name="email" type="email" value={contactInfo.email} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                <InfoInput icon={<FaMapMarkerAlt />} placeholder="Địa chỉ" name="address" value={contactInfo.address} onChange={(e) => handleInputChange(e, setContactInfo)} />
                            </div>
                        </div>

                        {/* HÀNH KHÁCH */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">HÀNH KHÁCH</h2>
                            <div className="space-y-4">
                                <QuantityCounter label="Người lớn" description="Trên 1m4" value={passengers.adults} onDecrease={() => handlePassengerCount('adults', -1)} onIncrease={() => handlePassengerCount('adults', 1)} />
                                <QuantityCounter label="Trẻ em" description="Dưới 1m4" value={passengers.children} onDecrease={() => handlePassengerCount('children', -1)} onIncrease={() => handlePassengerCount('children', 1)} />
                                <QuantityCounter label="Em bé" description="Dưới 2 tuổi (Miễn phí)" value={passengers.infants} onDecrease={() => handlePassengerCount('infants', -1)} onIncrease={() => handlePassengerCount('infants', 1)} />
                            </div>
                        </div>

                        {/* DỊCH VỤ CỘNG THÊM */}
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

                        {/* GHI CHÚ VÀ PHƯƠNG THỨC THANH TOÁN */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                          <h2 className="text-xl font-bold mb-4">GHI CHÚ</h2>
                          <textarea placeholder="Ghi chú thêm (nếu có)" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md"></textarea>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">PHƯƠNG THỨC THANH TOÁN</h2>
                            {/* Radio buttons for payment method... */}
                        </div>
                    </div>

                    {/* ✅ CỘT BÊN PHẢI (ASIDE) ĐÃ SỬA LẠI HOÀN CHỈNH */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">TÓM TẮT CHUYẾN ĐI</h2>
                            
                            {/* ✅ HIỂN THỊ DANH SÁCH TẤT CẢ TOUR */}
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-4">
                                {cartItems.map(item => (
                                    <div key={item.key} className="flex gap-4 border-b pb-2 last:border-0">
                                        <img src={item.image || '/images/default.jpg'} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                                        <div>
                                            <p className="font-bold text-sm text-blue-800">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.location}</p>
                                            <p className="text-sm font-semibold">{new Intl.NumberFormat("vi-VN").format((item.adults * item.priceAdult) + ((item.children || 0) * (item.priceChild || 0)))} ₫</p>
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

                            {/* ✅ NÚT THANH TOÁN ĐÃ CÓ LẠI */}
                            <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-400 flex items-center justify-center gap-2">
                                <FaCreditCard />
                                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN'}
                            </button>
                        </div>
                    </aside>
                </form>
            </div>
            {/* Notification Toast */}
        </div>
    );
}