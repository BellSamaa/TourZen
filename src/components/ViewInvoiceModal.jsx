// src/components/ViewInvoiceModal.jsx
// (Tệp mới)

import React, { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { X, CircleNotch, Printer, User, Envelope, Phone, Bank, Calendar, Hash } from "@phosphor-icons/react";

const supabase = getSupabase();

// --- Helpers Format (Copy) ---
const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: '2-digit', minute: '2-digit' });
    } catch (e) { return 'Invalid Date'; }
};
const formatPaymentMethod = (method) => {
    if (method === 'direct') return 'Trực tiếp';
    if (method === 'transfer') return 'Chuyển khoản';
    if (method === 'virtual_qr') return 'Thanh toán QR Ảo';
    return method || 'N/A';
};

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start py-3 border-b border-gray-100 dark:border-slate-700">
        <Icon className="w-5 h-5 text-sky-500 mr-3 mt-0.5 flex-shrink-0" weight="duotone" />
        <div className="flex-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block uppercase">{label}</span>
            <span className="text-base font-medium text-gray-800 dark:text-white break-words">{value || 'N/A'}</span>
        </div>
    </div>
);

export default function ViewInvoiceModal({ bookingId, onClose }) {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!bookingId) return;

        async function fetchInvoice() {
            setLoading(true);
            // Tìm hóa đơn dựa trên booking_id
            const { data, error } = await supabase
                .from("Invoices")
                .select("*")
                .eq("booking_id", bookingId)
                .limit(1)
                .single();

            if (error) {
                console.error("Lỗi tải hóa đơn:", error);
                toast.error("Không tìm thấy hóa đơn hoặc có lỗi xảy ra.");
                onClose();
            } else {
                setInvoice(data);
            }
            setLoading(false);
        }

        fetchInvoice();
    }, [bookingId, onClose]);

    const handlePrint = () => {
        // Tạm thời vô hiệu hóa các nút và chỉ in nội dung modal
        const printContent = document.getElementById("invoice-print-area");
        if (printContent) {
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Hóa đơn</title>');
            // Sao chép Tailwind hoặc CSS nội tuyến (cần thiết cho bản in đẹp)
             printWindow.document.write('<link href="https://cdn.tailwindcss.com" rel="stylesheet">');
             printWindow.document.write('<style> body { padding: 20px; } @page { size: auto; margin: 0; } </style>');
            printWindow.document.write('</head><body >');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); }, 500); // Đợi CSS tải
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 18, stiffness: 250 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Chi tiết Hóa đơn
                    </h3>
                    <button onClick={onClose} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <X size={22} weight="bold" />
                    </button>
                </div>

                {/* Body */}
                <div id="invoice-print-area" className="p-6 space-y-4 overflow-y-auto simple-scrollbar">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <CircleNotch size={32} className="animate-spin text-sky-500" />
                        </div>
                    ) : invoice ? (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-red-600">{formatCurrency(invoice.total_amount)}</h2>
                                <p className="text-gray-500 dark:text-gray-400">Đã thanh toán qua {formatPaymentMethod(invoice.payment_method)}</p>
                            </div>
                            
                            <InfoRow icon={Hash} label="Mã Hóa đơn" value={invoice.id} />
                            <InfoRow icon={Hash} label="Mã Đơn hàng (Booking)" value={invoice.booking_id} />
                            <InfoRow icon={Calendar} label="Ngày tạo Hóa đơn" value={formatDate(invoice.created_at)} />
                            
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-white pt-4 mt-4 border-t dark:border-slate-700">Thông tin Khách hàng</h4>
                            <InfoRow icon={User} label="Tên Khách hàng" value={invoice.customer_name} />
                            <InfoRow icon={Envelope} label="Email" value={invoice.customer_email} />
                            <InfoRow icon={Phone} label="Số điện thoại" value={invoice.customer_phone} />

                            {/* Hiển thị chi tiết bank nếu là virtual_qr */}
                            {invoice.payment_method === 'virtual_qr' && invoice.billing_details && (
                                <>
                                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white pt-4 mt-4 border-t dark:border-slate-700">Chi tiết Thanh toán (QR)</h4>
                                    <InfoRow icon={Bank} label="Số tài khoản (đã nhập)" value={invoice.billing_details.bankAccount} />
                                    <InfoRow icon={User} label="Tên chủ tài khoản (đã nhập)" value={invoice.billing_details.accountName} />
                                </>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-gray-500 py-10">Không tìm thấy dữ liệu hóa đơn.</p>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                    <button 
                        type="button" 
                        onClick={handlePrint} 
                        disabled={loading || !invoice} 
                        className="modal-button-secondary flex items-center gap-1.5"
                    >
                        <Printer size={18} /> In Hóa đơn
                    </button>
                    <button type="button" onClick={onClose} className="modal-button-primary">
                        Đóng
                    </button>
                </div>
            </motion.div>
             <style jsx>{`
                 .modal-button-secondary { @apply px-5 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50 transition-colors; }
                 .modal-button-primary { @apply px-5 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50 transition-colors; }
                 .simple-scrollbar::-webkit-scrollbar { width: 6px; }
                 .simple-scrollbar::-webkit-scrollbar-track { background: transparent; }
                 .simple-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                 .dark .simple-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
            `}</style>
        </motion.div>
    );
}
