// src/components/DestinationsGrid.jsx
import React from "react";
import { DESTINATIONS } from "../data/tours";

const DestinationsGrid = () => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Điểm đến nổi bật</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {DESTINATIONS.map((dest) => (
          <div
            key={dest.id}
            className="border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{dest.name}</h3>
              <p className="text-gray-600 text-sm">{dest.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DestinationsGrid;
