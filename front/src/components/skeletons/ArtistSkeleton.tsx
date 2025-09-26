import React from "react";

const ArtistSkeleton = () => (
  <div className="artist-card bg-gray-200 animate-pulse p-4 rounded-full shadow-md flex items-center space-x-3">
    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
    <div className="flex flex-col space-y-1">
      <div className="h-3 w-20 bg-gray-300 rounded"></div>
      <div className="h-2 w-12 bg-gray-300 rounded"></div>
    </div>
  </div>
);

export default ArtistSkeleton;
