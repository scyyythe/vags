import React from "react";

const BidDetailsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <div className="h-16 bg-gray-200 animate-pulse"></div>

      {/* Back button skeleton */}
      <div className="w-[200px] ml-3 mt-20 px-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
          <div className="w-20 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>

      <div className="flex justify-center items-start space-x-2 mt-2">
        <div className="flex justify-center items-start ml-[260px]">
          {/* Artwork container */}
          <div className="mr-8 w-full">
            {/* Sidebar skeleton (desktop) */}
            <div className="relative w-full">
              <div className="absolute top-3 z-20 left-[-250px] hidden lg:block" style={{ width: "150px" }}>
                <div className="p-3 text-left rounded-sm">
                  <div className="w-8 h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="max-h-[440px] overflow-y-auto pr-1 flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="w-12 h-3 bg-gray-300 rounded mb-1"></div>
                          <div className="w-16 h-2 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Center - Artwork Image skeleton */}
            <div className="relative z-0 mt-8 w-[400px]">
              <div className="inline-block transform scale-[1.10] -mb-6 relative left-[-60px]">
                <div className="w-[420px] h-[400px] bg-gray-300 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Right side - Details skeleton */}
          <div className="w-[730px] -ml-[250px] mt-3 h-[450px] border">
            <div className="p-4">
              {/* Header actions skeleton */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-8 bg-gray-300 rounded-3xl"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <div className="w-6 h-4 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>

              {/* Title skeleton */}
              <div className="w-48 h-6 bg-gray-300 rounded mb-2"></div>

              {/* Artist skeleton */}
              <div className="w-32 h-3 bg-gray-300 rounded mb-4"></div>

              {/* Description skeleton */}
              <div className="space-y-2 mb-4">
                <div className="w-full h-3 bg-gray-300 rounded"></div>
                <div className="w-full h-3 bg-gray-300 rounded"></div>
                <div className="w-3/4 h-3 bg-gray-300 rounded"></div>
              </div>

              {/* Horizontal info grid skeleton */}
              <div className="w-full py-3 mb-4 grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-3 bg-gray-300 rounded mb-1 mx-auto"></div>
                    <div className="w-12 h-3 bg-gray-300 rounded mx-auto"></div>
                  </div>
                ))}
              </div>

              {/* Bid section skeleton */}
              <div className="w-full border px-10 py-4 rounded-xl flex justify-between items-center text-center mt-4 mb-2">
                <div className="flex-1">
                  <div className="w-20 h-3 bg-gray-300 rounded mb-2 mx-auto"></div>
                  <div className="w-24 h-6 bg-gray-300 rounded mx-auto"></div>
                </div>
                <div className="w-[1px] h-12 bg-gray-200 mx-7"></div>
                <div className="w-32 h-8 bg-gray-300 rounded"></div>
              </div>

              {/* Button skeleton */}
              <div className="w-full h-10 bg-gray-300 rounded-full mt-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidDetailsSkeleton;
