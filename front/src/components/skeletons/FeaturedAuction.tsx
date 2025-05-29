import React from "react";

const FeaturedAuctionSkeleton = () => {
  return (
    <div className="flex items-center px-8 py-8 gap-12">
      <div className="aspect-square bg-gray-300 rounded-xl shadow-xl animate-pulse w-[38%]"></div>

      <div className="flex flex-col justify-center w-[50%] gap-4">
        <div className="h-10 bg-gray-300 rounded-md w-3/5 animate-pulse"></div>

        <div className="flex items-center gap-2 mt-2">
          <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gray-300 w-8 h-8 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded-md w-24 animate-pulse"></div>
          </div>
        </div>

        <div className="bg-gray-200 rounded-md px-16 py-7 flex max-w-[475px] animate-pulse">
          <div className="flex w-full">
            <div className="flex-1 text-center">
              <div className="h-4 bg-gray-300 rounded-md w-16 mx-auto mb-3"></div>
              <div className="h-8 bg-gray-300 rounded-md w-24 mx-auto"></div>
            </div>

            <div className="border-l border-gray-300 h-19 mx-12"></div>

            <div className="flex flex-col text-center flex-1">
              <div className="h-8 bg-gray-300 rounded-md w-24 mx-auto"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 mt-4">
          <div className="bg-gray-300 rounded-full w-[38%] h-10 animate-pulse"></div>
          <div className="bg-gray-300 rounded-full w-[38%] h-10 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedAuctionSkeleton;
