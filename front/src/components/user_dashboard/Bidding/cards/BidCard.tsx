// BidCard.tsx
import React from 'react';

export interface BidCardData {
  id: string;
  title: string;
  currentBid: number;
  timeRemaining: string;
  imageUrl: string;
}

interface BidCardProps {
  data: BidCardData;
  isLoading?: boolean;
  onPlaceBid?: (id: string) => void;
}

const BidCard: React.FC<BidCardProps> = ({ data, isLoading = false, onPlaceBid }) => {
  if (isLoading) {
    return (
      <div className="max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white animate-pulse p-4">
        <div className="w-full h-48 bg-gray-300 rounded-xl mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="flex items-center justify-between mt-4">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-8 bg-gray-300 rounded-full w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white">
      <div className="relative">
        <img src={data.imageUrl} alt={data.title} className="w-full h-48 object-cover" />
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-3 py-1 rounded-full">
          {data.timeRemaining}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{data.title}</h2>
        <div className="flex items-center justify-between">
          <div className="text-gray-500">
            Current Bid <span className="font-bold text-black">{data.currentBid} ETH</span>
          </div>
          <button
            onClick={() => onPlaceBid?.(data.id)}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-full"
          >
            Place A Bid
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidCard;
