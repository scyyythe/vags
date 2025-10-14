import React from "react";

const BidCardSkeleton: React.FC = () => {
  return (
    <div className="w-full rounded-xl bg-white animate-pulse">
      <div className="relative">
        {/* Image skeleton */}
        <div className="w-full h-56 bg-gray-300 rounded-xl"></div>

        {/* Timer display skeleton */}
        <div className="absolute top-0.5 left-4">
          <div className="absolute top-3.5 left-0">
            <div className="bg-gray-200 w-32 h-8 rounded-[5px]"></div>
          </div>
        </div>

        {/* Three dots menu skeleton */}
        <div className="absolute top-4 right-3">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        </div>

        {/* Bottom overlay skeleton */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-gray-200 h-[69px] px-6 flex items-center justify-between rounded-lg">
            <div className="flex flex-col justify-center gap-2">
              {/* Title skeleton */}
              <div className="w-24 h-3 bg-gray-300 rounded"></div>

              {/* Current bid skeleton */}
              <div className="w-16 h-3 bg-gray-300 rounded"></div>
            </div>

            {/* Button skeleton */}
            <div className="w-20 h-7 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidCardSkeleton;
