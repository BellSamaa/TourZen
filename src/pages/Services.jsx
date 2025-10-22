// src/pages/Services.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { FaHotel, FaCar, FaPlane, FaSpinner, FaTags } from 'react-icons/fa'; // Thêm FaTags
import { motion } from 'framer-motion';

const supabase = getSupabase();

// Hàm định dạng giá
const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

// Component thẻ hiển thị dịch vụ
const ServiceCard = ({ item }) => {
    let icon, detailsText;
    // Lấy icon và text chi tiết dựa trên loại NCC
    switch (item.type) {
        case 'hotel':
            icon = <FaHotel className="text-blue-500 text-3xl mb-3" />;
            detailsText = `📍 ${item.details?.location || 'N/A'} | ⭐ ${item.details?.rating || 'N/A'} | ${formatPrice(item.price)}/đêm`;
            break;
        case 'transport':
            icon = <FaCar className="text-orange-500 text-3xl mb-3" />;
            detailsText = `🚗 ${item.details?.vehicle_type || 'N/A'} | ${item.details?.seats || '?'} chỗ | ${formatPrice(item.price)}`;
            break;
        case 'flight':
            icon = <FaPlane className="text-indigo-500 text-3xl mb-3" />;
            detailsText = `✈️ ${item.details?.airline || 'N/A'} | ${item.details?.route || 'N/A'} | ${formatPrice(item.price)}`;
            break;
        default:
            icon = null;
            detailsText = '';
    }

    return (
        <motion.div
            className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 border dark:border-neutral-700 text-center h-full flex flex-col justify-between" // Thêm h-full và flex
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
        >
            <div> {/* Bọc nội dung vào div để flexbox hoạt động đúng */}
                {icon}
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2">{item.name}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{detailsText}</p>
            </div>
            {/* Có thể thêm nút "Xem chi tiết" nếu cần */}
             {/* <button className="mt-4 text-sm text-sky-600 hover:underline">Xem thêm</button> */}
        </motion.div>
    );
};


export default function Services() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'hotel', 'transport', 'flight'

    useEffect(() => {
        // Hàm tải các NCC đã được duyệt
        async function fetchApprovedSuppliers() {
            setLoading(true);
            setError(null);
            const { data, error: fetchError } = await supabase
                .from('Suppliers')
                .select('*')
                .eq('approval_status', 'approved') // Chỉ lấy cái đã duyệt
                .order('type', { ascending: true }) // Sắp xếp theo loại
                .order('name', { ascending: true }); // Rồi sắp xếp theo tên

            if (fetchError) {
                console.error("Lỗi tải dịch vụ:", fetchError);
                setError("Không thể tải danh sách dịch vụ.");
            } else {
                setSuppliers(data || []);
            }
            setLoading(false);
        }
        fetchApprovedSuppliers();
    }, []);

    // Lọc danh sách NCC dựa trên filter
    const filteredSuppliers = useMemo(() => {
        if (filter === 'all') return suppliers;
        return suppliers.filter(s => s.type === filter);
    }, [suppliers, filter]);

    // Các tùy chọn bộ lọc
    const filterOptions = [
        { value: 'all', label: 'Tất cả', Icon: FaTags }, // Thêm Icon
        { value: 'hotel', label: 'Khách sạn', Icon: FaHotel },
        { value: 'transport', label: 'Vận chuyển', Icon: FaCar },
        { value: 'flight', label: 'Chuyến bay', Icon: FaPlane },
    ];

    // Hiển thị loading
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <FaSpinner className="animate-spin text-4xl text-sky-500" />
            </div>
        );
    }

    // Hiển thị lỗi
    if (error) {
        return <div className="text-center py-20 text-red-600 dark:text-red-400">{error}</div>;
    }

    // Giao diện chính của trang
    return (
        <main className="bg-neutral-50 dark:bg-neutral-900 min-h-screen">
            <div className="container mx-auto px-4 py-16">
                {/* Tiêu đề trang */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-white">
                        Dịch vụ Cung cấp bởi TourZen & Đối tác
                    </h1>
                    <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">
                        Khám phá các lựa chọn khách sạn, vận chuyển và chuyến bay uy tín đã được xác thực.
                    </p>
                </motion.div>

                 {/* Các nút lọc */}
                 <div className="flex justify-center flex-wrap gap-3 mb-10">
                    {filterOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setFilter(opt.value)}
                            // Style nút lọc, active state
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                                filter === opt.value
                                ? 'bg-sky-600 text-white shadow'
                                : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600'
                            }`}
                        >
                            {/* Hiển thị Icon nếu có */}
                            {opt.Icon && <opt.Icon size={16}/>}
                            {opt.label}
                        </button>
                    ))}
                 </div>


                {/* Danh sách dịch vụ */}
                {filteredSuppliers.length > 0 ? (
                    // Grid layout cho các thẻ dịch vụ
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredSuppliers.map((supplier) => (
                            <ServiceCard key={supplier.id} item={supplier} />
                        ))}
                    </div>
                ) : (
                    // Thông báo nếu không có dịch vụ nào phù hợp
                    <motion.div
                        className="text-center py-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className="text-xl text-neutral-500 dark:text-neutral-400">
                            Không tìm thấy dịch vụ nào {filter !== 'all' ? `thuộc loại '${filter.replace('transport', 'vận chuyển').replace('flight', 'chuyến bay')}'` : ''} đã được duyệt.
                        </p>
                    </motion.div>
                )}
            </div>
        </main>
    );
}