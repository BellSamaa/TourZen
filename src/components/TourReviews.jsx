// src/components/TourReviews.jsx
// (Component mới để hiển thị danh sách bình luận cho 1 tour)

import React, { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { CircleNotch, Star, UserCircle, ChatCircleDots } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = getSupabase();

// Component con để hiển thị sao
const RatingDisplay = ({ rating, size = 16 }) => {
    const totalStars = 5;
    return (
        <div className="flex text-yellow-500" title={`${rating}/${totalStars} sao`}>
            {[...Array(totalStars)].map((_, i) => (
                <Star key={i} weight={i < rating ? "fill" : "regular"} size={size} />
            ))}
        </div>
    );
};

// Component con cho mỗi bình luận
const ReviewItem = ({ review }) => {
    const userName = review.user?.full_name || 'Khách';
    const avatarUrl = review.user?.avatar_url; // Giả sử bạn có cột avatar_url

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3 py-4 border-b border-gray-100 dark:border-neutral-700"
        >
            {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
                <UserCircle size={40} className="text-gray-400" />
            )}
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="font-semibold text-sm text-gray-800 dark:text-white">{userName}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                        </p>
                    </div>
                    <RatingDisplay rating={review.rating} />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">
                    "{review.comment}"
                </p>
            </div>
        </motion.div>
    );
};

// Component chính
export default function TourReviews({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!productId) {
            setLoading(false);
            setError("Không có ID tour.");
            return;
        }

        const fetchReviews = async () => {
            setLoading(true);
            setError(null);
            
            // Lấy reviews và join với bảng Users để lấy tên
            const { data, error: fetchError } = await supabase
                .from('Reviews')
                .select(`
                    id,
                    created_at,
                    rating,
                    comment,
                    user:user_id ( full_name, avatar_url )
                `)
                .eq('product_id', productId)
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error("Lỗi tải reviews:", fetchError);
                setError(fetchError.message);
            } else {
                setReviews(data || []);
            }
            setLoading(false);
        };

        fetchReviews();
    }, [productId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <CircleNotch size={32} className="animate-spin text-sky-500" />
                <span className="ml-2 dark:text-white">Đang tải đánh giá...</span>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center py-5">Lỗi: {error}</div>;
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 dark:text-white">
                <ChatCircleDots size={28} />
                Đánh giá từ khách hàng ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6 italic">
                    Chưa có đánh giá nào cho tour này.
                </p>
            ) : (
                <div className="border-t border-gray-200 dark:border-neutral-600">
                    <AnimatePresence>
                        {reviews.map(review => (
                            <ReviewItem key={review.id} review={review} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}