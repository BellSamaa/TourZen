// src/components/MostLovedTour.jsx
// (Component mới để hiển thị tour được yêu thích nhất)

import React, { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { CircleNotch, Star, Gift } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const supabase = getSupabase();

// Component con để hiển thị sao
const RatingDisplay = ({ rating, size = 18 }) => {
    const totalStars = 5;
    return (
        <div className="flex text-yellow-500" title={`${rating.toFixed(1)}/${totalStars} sao`}>
            {[...Array(totalStars)].map((_, i) => (
                <Star key={i} weight={i < rating ? "fill" : "regular"} size={size} />
            ))}
            <span className="ml-2 text-sm font-semibold text-gray-600 dark:text-gray-300">({rating.toFixed(1)})</span>
        </div>
    );
};

// Hàm format tiền tệ
const formatCurrency = (number) => {
  if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
};

export default function MostLovedTour() {
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopTour = async () => {
            setLoading(true);
            
            // Lấy tour có rating cao nhất
            // (Đảm bảo cột 'rating' trong bảng 'Products' của bạn được cập nhật
            // bởi trigger 'update_product_average_rating' mà chúng ta đã tạo)
            const { data, error } = await supabase
                .from('Products')
                .select('id, name, image_url, price_adult, rating, location')
                .eq('product_type', 'tour') // Chỉ lấy tour
                .order('rating', { ascending: false }) // Sắp xếp theo rating
                .limit(1) // Lấy 1
                .single(); // Lấy 1 đối tượng duy nhất

            if (data && !error) {
                setTour(data);
            } else {
                console.error("Lỗi tải top tour:", error);
            }
            setLoading(false);
        };

        fetchTopTour();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-60 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                <CircleNotch size={32} className="animate-spin text-sky-500" />
            </div>
        );
    }

    if (!tour) {
        return <div className="text-center p-5 dark:text-white">Không tìm thấy tour nào.</div>;
    }

    return (
        <section className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-neutral-900 dark:to-slate-900 p-8 rounded-xl shadow-lg border dark:border-neutral-700">
            <h2 className="text-3xl font-bold text-center mb-6 text-sky-700 dark:text-sky-400 flex items-center justify-center gap-3">
                <Gift size={32} /> Tour được yêu thích nhất
            </h2>
            <motion.div 
                className="flex flex-col md:flex-row bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <img 
                    src={tour.image_url} 
                    alt={tour.name} 
                    className="w-full md:w-1/2 h-64 md:h-auto object-cover"
                />
                <div className="p-6 flex flex-col justify-between">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{tour.location}</span>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white my-2">
                            {tour.name}
                        </h3>
                        {tour.rating && <RatingDisplay rating={tour.rating} />}
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Giá chỉ từ</span>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-500">
                                {formatCurrency(tour.price_adult)}
                            </p>
                        </div>
                        <Link 
                            to={`/tour/${tour.id}`} 
                            className="mt-4 sm:mt-0 px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg text-center hover:bg-sky-700 transition-colors shadow-md"
                        >
                            Xem Chi Tiết
                        </Link>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}