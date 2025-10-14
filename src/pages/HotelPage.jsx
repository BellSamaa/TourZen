// src/pages/HotelPage.jsx
import React from 'react';
import HotelCard from '../components/HotelCard.jsx';
// import FilterSidebar from '../components/FilterSidebar.jsx';

const hotels = [
    { id: 1, name: 'Vinpearl Resort & Spa Phú Quốc', location: 'Phú Quốc', rating: 5, reviews: 1280, price: 2500000, image: 'https://cdn1.ivivu.com/iVivu/2022/01/18/14/vinpearlphuquoc-1-660x420.gif' },
    { id: 2, name: 'InterContinental Danang Sun Peninsula Resort', location: 'Đà Nẵng', rating: 5, reviews: 980, price: 7800000, image: 'https://cdn1.ivivu.com/iVivu/2020/09/24/11/intercontinental-da-nang-sun-peninsula-resort-1-660x420.jpg' },
    // ... thêm khách sạn khác
];

export default function HotelPage() {
    return (
        <div className="bg-neutral-50 dark:bg-neutral-900">
            <div className="container mx-auto px-6 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-white mb-2">Khách sạn & Khu nghỉ dưỡng</h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400">Tìm kiếm nơi ở hoàn hảo cho chuyến đi của bạn.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Cột Filter */}
                    <aside className="w-full md:w-1/4 lg:w-1/5">
                        <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-soft sticky top-28">
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 border-b pb-2">Bộ lọc</h3>
                            {/* Các ô filter sẽ nằm ở đây */}
                            <p className="text-neutral-600 dark:text-neutral-400">Sắp ra mắt...</p>
                        </div>
                    </aside>

                    {/* Cột Kết quả */}
                    <main className="w-full md:w-3/4 lg:w-4/5">
                        <div className="grid grid-cols-1 gap-6">
                            {hotels.map(hotel => (
                                <HotelCard key={hotel.id} hotel={hotel} />
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}