// src/pages/HotelPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Đảm bảo bạn đã import supabase client
import HotelCard from '../components/HotelCard.jsx';
import { CircleNotch } from '@phosphor-icons/react'; // Thêm icon loading

export default function HotelPage() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchHotels() {
            setLoading(true);
            const { data, error } = await supabase
                .from('hotels')
                .select('*')
                .order('rating', { ascending: false }); // Sắp xếp theo rating

            if (error) {
                console.error('Error fetching hotels:', error);
                setError(error.message);
            } else {
                setHotels(data);
            }
            setLoading(false);
        }

        fetchHotels();
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <CircleNotch size={48} className="animate-spin text-primary-blue" />
                    <span className="ml-3 text-lg text-neutral-600 dark:text-neutral-400">Đang tải khách sạn...</span>
                </div>
            );
        }

        if (error) {
            return <p className="text-center text-red-500">Lỗi: {error}</p>;
        }

        if (hotels.length === 0) {
            return <p className="text-center text-neutral-600 dark:text-neutral-400">Không tìm thấy khách sạn nào.</p>;
        }

        return (
            <div className="grid grid-cols-1 gap-6">
                {hotels.map(hotel => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-neutral-50 dark:bg-neutral-900 min-h-screen">
            <div className="container mx-auto px-6 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-white mb-2">Khách sạn & Khu nghỉ dưỡng</h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400">Tìm kiếm nơi ở hoàn hảo cho chuyến đi của bạn.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Cột Filter */}
                    <aside className="w-full md:w-1/4 lg:w-1/5">
                        <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-soft sticky top-28">
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 border-b pb-2 border-neutral-200 dark:border-neutral-700">Bộ lọc</h3>
                            {/* Các ô filter sẽ nằm ở đây */}
                            <p className="text-neutral-600 dark:text-neutral-400">Sắp ra mắt...</p>
                        </div>
                    </aside>

                    {/* Cột Kết quả */}
                    <main className="w-full md:w-3/4 lg:w-4/5">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
}