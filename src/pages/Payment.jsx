// src/pages/Payment.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserFriends, FaMapMarkerAlt, FaMinus, FaPlus, FaCreditCard } from "react-icons/fa";
import { IoIosMail, IoIosCall } from "react-icons/io";

// --- Helper Components ---
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

// --- Main Payment Component ---
export default function Payment() {
    const navigate = useNavigate();
    // ✅ THAY ĐỔI: Lấy `total` trực tiếp từ useCart
    const { items: cartItems, clearCart, total } = useCart();

    // --- State Management ---
    const [step] = useState(1);
    const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", address: "" });
    // ✅ THAY ĐỔI: Tính tổng số người lớn từ tất cả các tour trong giỏ hàng
    const totalAdults = useMemo(() => cartItems.reduce((sum, item) => sum + (item.adults || 0), 0), [cartItems]);
    const [passengerDetails, setPassengerDetails] = useState([]);
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("direct");
    const [selectedBranch, setSelectedBranch] = useState("Số 123, Đường ABC, Quận Hoàn Kiếm, Hà Nội");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: "", type: "" });

    // --- Effects ---
    // ✅ THAY ĐỔI: Cập nhật form thông tin hành khách dựa trên tổng số người lớn
    useEffect(() => {
        setPassengerDetails(prevDetails => {
            const newDetails = Array.from({ length: totalAdults }, (_, index) => {
                return prevDetails[index] || { name: "", gender: "Nam", dob: "" };
            });
            return newDetails;
        });
    }, [totalAdults]);


    // --- Memoized Calculations ---
    const paymentDeadline = useMemo(() => {
        if (cartItems.length === 0) {
            const today = new Date();
            today.setDate(today.getDate() + 7);
            return today;
        }
        const earliestDate = cartItems
            .map(item => item.departureDates?.[0])
            .filter(Boolean)
            .map(dateStr => new Date(dateStr))
            .sort((a, b) => a - b)[0] || new Date();

        earliestDate.setDate(earliestDate.getDate() - 7);
        return earliestDate;
    }, [cartItems]);

    const formattedDeadline = paymentDeadline.toLocaleDateString("vi-VN", {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    
    // ✅ THAY ĐỔI: Tính tổng chiết khấu (nếu có)
    const discount = 800000; // Ưu đãi giờ chót

    // --- Handlers ---
    const handleInputChange = (e, setState) => {
        setState(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
    
    const formatCurrency = (number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);

    const handleCheckout = async (e) => {
        e.preventDefault();
        // Validation checks...
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
        
        // ✅ THAY ĐỔI: Tạo danh sách tour cho email
        const tourListForEmail = cartItems.map(item => 
            `<li><b>${item.title}</b> (${item.adults} người lớn, ${item.children || 0} trẻ em) - ${formatCurrency((item.adults * item.priceAdult) + ((item.children || 0) * (item.priceChild || 0)))}</li>`
        ).join('');
        
        const totalPassengers = cartItems.reduce((sum, item) => sum + (item.adults || 0) + (item.children || 0) + (item.infants || 0), 0);

        const templateParams = {
            customer_name: contactInfo.name,
            customer_email: contactInfo.email,
            customer_phone: contactInfo.phone,
            tour_list: `<ul>${tourListForEmail}</ul>`, // Gửi dưới dạng danh sách HTML
            total_passengers: totalPassengers,
            passenger_list: passengerDetails.map(p => `- ${p.name} (${p.gender}, sinh ngày ${p.dob})`).join('\n'),
            total_amount: formatCurrency(total - discount),
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
        return (
            <div className="text-center py-20 text-xl font-semibold">
                Giỏ hàng của bạn đang trống. Vui lòng chọn một tour để thanh toán.
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    {/* Progress Bar */}
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
                        
                        {/* ✅ THAY ĐỔI: Bỏ phần chọn số lượng hành khách ở đây */}

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">THÔNG TIN HÀNH KHÁCH ({totalAdults} người lớn)</h2>
                            {passengerDetails.map((p, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b py-4 last:border-0">
                                    <p className="font-semibold md:col-span-1">Người lớn {index + 1}</p>
                                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <input placeholder="Họ tên *" value={p.name} onChange={(e) => handlePassengerDetailChange(index, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                                        <select value={p.gender} onChange={(e) => handlePassengerDetailChange(index, 'gender', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                            <option>Nam</option>
                                            <option>Nữ</option>
                                        </select>
                                        <input type="date" value={p.dob} onChange={(e) => handlePassengerDetailChange(index, 'dob', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Ghi chú & Phương thức thanh toán... */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                          <h2 className="text-xl font-bold mb-4">GHI CHÚ</h2>
                          <textarea placeholder="Quý khách có ghi chú gì lưu ý, hãy nói với chúng tôi" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md"></textarea>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                          <h2 className="text-xl font-bold mb-4">PHƯƠNG THỨC THANH TOÁN</h2>
                          {/* ...phần JSX của phương thức thanh toán giữ nguyên... */}
                        </div>

                    </div>

                    <aside className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">TÓM TẮT CHUYẾN ĐI</h2>
                            
                            {/* ✅ THAY ĐỔI: Lặp qua tất cả tour trong giỏ hàng */}
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                {cartItems.map(item => (
                                    <div key={item.key} className="flex gap-4 border-b pb-2 last:border-0">
                                        <img src={item.image || '/images/default.jpg'} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                                        <div>
                                            <p className="font-bold text-sm text-blue-800">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.location}</p>
                                            <p className="text-sm font-semibold">{formatCurrency((item.adults * item.priceAdult) + ((item.children || 0) * (item.priceChild || 0)))}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="space-y-2 text-sm border-t pt-4 mt-4">
                                <div className="flex justify-between">
                                    <span>Tạm tính</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>Ưu đãi</span>
                                    <span>- {formatCurrency(discount)}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <span className="text-lg font-bold">Tổng tiền</span>
                                {/* ✅ THAY ĐỔI: Dùng total từ context */}
                                <span className="text-2xl font-bold text-red-600">{formatCurrency(total - discount)}</span>
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
                {/* Notification Toast */}
            </AnimatePresence>
        </div>
    );
}