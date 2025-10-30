// src/pages/VirtualPayment.jsx
// (Tệp mới) - Trang giả lập thanh toán QR Ảo

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { FaUser, FaEnvelope, FaPhone, FaUniversity, FaCreditCard, FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";

const supabase = getSupabase();

// --- Component InfoInput (Copy từ Payment.jsx) ---
const InfoInput = ({ icon: Icon, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             {Icon && <Icon className="text-gray-400" />}
        </div>
        <input
            {...props}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
        />
    </div>
);

// --- Hàm format tiền tệ (Copy từ Payment.jsx) ---
const formatCurrency = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
};


export default function VirtualPayment() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Lấy dữ liệu từ trang Payment
    const { bookingIds, finalTotal, contactInfo, deadline } = location.state || {};

    const [paymentDetails, setPaymentDetails] = useState({
        bankAccount: "",
        accountName: "",
        ...contactInfo // Lấy name, email, phone từ contactInfo
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Nếu không có dữ liệu, điều hướng về trang chủ
        if (!bookingIds || !finalTotal || !contactInfo) {
            toast.error("Phiên thanh toán không hợp lệ.");
            navigate("/");
        }
    }, [bookingIds, finalTotal, contactInfo, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails(prev => ({ ...prev, [name]: value }));
    };

    // Hàm tạo hóa đơn ảo
    const createInvoice = async (bookingId, billingData) => {
        const { error } = await supabase.from("Invoices").insert({
            booking_id: bookingId,
            customer_name: paymentDetails.name,
            customer_email: paymentDetails.email,
            customer_phone: paymentDetails.phone,
            total_amount: finalTotal,
            payment_method: 'virtual_qr',
            billing_details: billingData // Lưu STK và Tên TK
        });

        if (error) {
            // Lỗi có thể xảy ra nếu đã tồn tại hóa đơn (uq_booking_id)
            if (error.code === '23505') {
                 console.warn("Hóa đơn đã tồn tại cho booking:", bookingId);
                 return; // Bỏ qua lỗi trùng lặp
            }
            throw error; // Ném các lỗi khác
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!paymentDetails.bankAccount || !paymentDetails.accountName) {
            toast.error("Vui lòng điền thông tin tài khoản ngân hàng.");
            return;
        }
        
        setIsSubmitting(true);
        toast.loading("Đang xử lý thanh toán...");

        // Giả lập độ trễ thanh toán
        await new Promise(res => setTimeout(res, 2500));

        try {
            // Chỉ tạo hóa đơn cho booking đầu tiên (đại diện cho đơn hàng)
            // (Theo yêu cầu: tạo hóa đơn sau khi thanh toán thành công)
            const representativeBookingId = bookingIds[0];
            
            const billingData = {
                bankAccount: paymentDetails.bankAccount,
                accountName: paymentDetails.accountName
            };

            await createInvoice(representativeBookingId, billingData);
            
            // (TùY CHỌN: Cập nhật trạng thái booking thành 'confirmed')
            // Theo yêu cầu "admin sẽ gọi xác nhận", chúng ta sẽ KHÔNG cập nhật
            // status ở đây, chỉ tạo hóa đơn và báo thành công cho user.
            // Admin sẽ thấy đơn 'pending' + 'virtual_qr' + Hóa đơn.

            toast.dismiss();
            toast.success("Thanh toán thành công!");

            // Điều hướng đến PaymentSuccess
            navigate('/booking-success', { 
                state: { 
                    virtual_qr_success: true, // Flag mới
                    bookingIds: bookingIds,
                    method: 'virtual_qr',
                    deadline: deadline // Vẫn truyền deadline
                } 
            });

        } catch (error) {
            setIsSubmitting(false);
            toast.dismiss();
            console.error("Lỗi khi tạo hóa đơn:", error);
            toast.error(`Đã xảy ra lỗi: ${error.message}`);
        }
    };

    if (!bookingIds) return null; // Tránh render khi đang điều hướng

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 flex items-center justify-center py-12 px-4">
            <motion.div 
                className="max-w-2xl w-full bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Cột trái: QR Code giả */}
                    <div className="bg-gray-50 dark:bg-neutral-700 p-8 flex flex-col items-center justify-center">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quét để thanh toán</h2>
                        {/* QR Giả */}
                        <div className="w-48 h-48 bg-gray-300 dark:bg-neutral-500 rounded-lg flex items-center justify-center text-gray-500 dark:text-neutral-300">
                           [Ảnh QR Code Giả]
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 text-center">
                            Hoặc điền thông tin bên dưới để hoàn tất
                        </p>
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng cộng</p>
                            <p className="text-3xl font-bold text-red-600">{formatCurrency(finalTotal)}</p>
                        </div>
                    </div>

                    {/* Cột phải: Form thông tin */}
                    <div className="p-8">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Xác nhận thông tin</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InfoInput icon={FaUser} name="name" placeholder="Họ và tên (chủ thẻ)" value={paymentDetails.name} onChange={handleChange} required />
                            <InfoInput icon={FaEnvelope} name="email" type="email" placeholder="Email" value={paymentDetails.email} onChange={handleChange} required disabled />
                            <InfoInput icon={FaPhone} name="phone" type="tel" placeholder="Số điện thoại" value={paymentDetails.phone} onChange={handleChange} required disabled />
                            <hr className="dark:border-neutral-600"/>
                            <InfoInput icon={FaUniversity} name="bankAccount" placeholder="Số tài khoản ngân hàng *" value={paymentDetails.bankAccount} onChange={handleChange} required />
                            <InfoInput icon={FaUser} name="accountName" placeholder="Tên chủ tài khoản *" value={paymentDetails.accountName} onChange={handleChange} required />
                            
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-6 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCreditCard />}
                                {isSubmitting ? "ĐANG THANH TOÁN..." : `XÁC NHẬN THANH TOÁN (${formatCurrency(finalTotal)})`}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
