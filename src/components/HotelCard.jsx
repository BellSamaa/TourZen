// src/components/HotelCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';

export default function HotelCard({ hotel }) {
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(hotel.price) + '₫';

  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-neutral-800 rounded-xl shadow-soft overflow-hidden hover:shadow-lifted transition-all duration-300 group">
      <div className="md:w-2/5 h-56 md:h-auto overflow-hidden">
        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div>
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />
            {hotel.location}
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white my-2">{hotel.name}</h3>
          <div className="flex items-center">
            {Array.from({ length: hotel.rating }).map((_, i) => (
              <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
            ))}
            <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300 font-medium">({hotel.reviews} đánh giá)</span>
          </div>
        </div>
        <div className="mt-auto pt-4 text-right">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Giá mỗi đêm từ</span>
          <p className="font-extrabold text-2xl text-secondary-dark">{formattedPrice}</p>
          <Link to={`/hotel/${hotel.id}`} className="mt-2 inline-block bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg">
            Xem phòng
          </Link>
        </div>
      </div>
    </div>
  );
}