// src/components/HotelCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';

export default function HotelCard({ hotel }) {
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(hotel.price) + '₫';

  return (
    <div className="flex bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      <img src={hotel.image} alt={hotel.name} className="w-1/3 h-auto object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
            {hotel.location}
          </div>
          <h3 className="text-lg font-bold text-gray-800 my-1">{hotel.name}</h3>
          <div className="flex items-center">
            {Array.from({ length: hotel.rating }).map((_, i) => (
              <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
            ))}
            <span className="ml-2 text-xs text-gray-600">({hotel.reviews} đánh giá)</span>
          </div>
        </div>
        <div className="mt-auto pt-4 text-right">
          <span className="text-sm text-gray-500">Giá mỗi đêm từ</span>
          <p className="font-bold text-xl text-accent-orange-dark">{formattedPrice}</p>
          <Link to={`/hotel/${hotel.id}`} className="mt-2 inline-block bg-primary-blue hover:bg-primary-blue-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            Xem phòng
          </Link>
        </div>
      </div>
    </div>
  );
}