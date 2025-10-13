import React from "react";

const ArtworkSummarySkeleton: React.FC = () => {
  return (
    <div className="animate-pulse flex justify-center items-center w-full">
      <div className="flex flex-col md:flex-row justify-center items-center p-4 md:pl-32">
        <div className="w-full md:w-[600px] h-72 md:h-[260px] bg-gray-300 rounded-xl md:mr-6" />

        <div className="w-full md:w-2/3 px-4 py-5 text-center md:text-left space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto md:mx-0"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto md:mx-0"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>

          <div className="h-6 bg-gray-300 rounded w-1/2 mt-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>

          <div className="h-4 bg-gray-300 rounded w-1/2 mt-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkSummarySkeleton;
