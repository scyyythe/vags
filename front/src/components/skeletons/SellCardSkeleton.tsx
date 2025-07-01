import React from "react";

const SellCardSkeleton = () => {
  return (
    <div className="sell-card h-full text-xs rounded-xl bg-white border border-gray-200 px-3 py-3 animate-pulse">
      <div className="relative">
        {/* Image Placeholder */}
        <div className="rounded-md w-full h-44 bg-gray-200" />

        {/* Icons Placeholder */}
        <div className="absolute top-2 right-9 w-6 h-6 bg-gray-300 rounded-full" />
        <div className="absolute top-2 right-2 w-6 h-6 bg-gray-300 rounded-full" />

        {/* Rating Placeholder */}
        <div className="absolute bottom-2 right-2 w-14 h-5 bg-gray-200 rounded-full" />
      </div>

      <div className="flex justify-between mt-3 items-center">
        <div className="flex items-center gap-2">
          <div className="w-12 h-4 bg-gray-200 rounded" />
          <div className="w-10 h-3 bg-gray-200 rounded" />
        </div>
        <div className="w-6 h-6 bg-gray-300 rounded-full" />
      </div>

      <div className="flex justify-between mt-1.5 items-center">
        <div className="w-1/2 h-3 bg-gray-200 rounded" />
        <div className="w-16 h-6 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
};

export default SellCardSkeleton;
