import React from 'react';
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import BidMenu from "./BidMenu";
import BidPopup from "../place_bid/BidPopup";

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
  onPlaceBid?: (id: string, amount: number) => void;
}

const BidCard: React.FC<BidCardProps> = ({ data, isLoading = false, onPlaceBid }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [showBidPopup, setShowBidPopup] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl overflow-hidden shadow-lg bg-white animate-pulse p-4">
        <div className="w-full h-36 bg-gray-300 rounded-xl mb-4"></div> 
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="flex items-center justify-between mt-4">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-8 bg-gray-300 rounded-full w-24"></div>
        </div>
      </div>
    );
  }

  const handleHide = () => {
    setIsHidden(true);
    toast("Artwork hidden");
    setMenuOpen(false);
  };

  const handleReport = () => {
    setIsReported(!isReported);
    toast(isReported ? "Artwork report removed" : "Artwork reported");
    setMenuOpen(false);
  };

  const handleBidSubmit = (amount: number) => {
    onPlaceBid?.(data.id, amount);
    toast(`Bid of ${amount}K placed successfully!`);
  };

  return (
    <>
      <div className="w-full rounded-xl border bg-white hover:shadow-lg transition-all duration-300">
        <div className="relative">
          <img 
            src={data.imageUrl} 
            alt={data.title} 
            className="w-full h-36 object-cover rounded-xl" 
          />
            <div className="absolute top-4 right-4 font-semibold bg-white bg-opacity-60 text-black text-[9px] px-3 py-1 rounded-[3px]">
              {data.timeRemaining}
            </div>
        </div>
        <div className="px-6 py-5 flex flex-col gap-2"> 
          <div className="flex justify-between">
            <h2 className="text-sm font-semibold">{data.title}</h2> 
            <div className="relative text-gray-500" style={{ height: '24px' }}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((prev) => !prev);
                  }}
                  className={`p-1 rounded-full text-black bg-white bg-opacity-60 ${menuOpen ? '' : ''}`}
                >
                  <MoreHorizontal size={14} />
                </button>
                <BidMenu
                  isOpen={menuOpen}
                  onHide={handleHide}
                  onReport={handleReport}
                  isReported={isReported}
                />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-gray-500 text-[10px]">
              Current Bid <span className="text-sm font-bold text-black ml-2">{data.currentBid}k</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBidPopup(true);
              }}
              className="bg-red-800 hover:bg-red-700 text-white text-[9px] px-6 py-2 rounded-full whitespace-nowrap"
            >
              Place A Bid
            </button>
          </div>
        </div>
      </div>

      <BidPopup
        isOpen={showBidPopup}
        onClose={() => setShowBidPopup(false)}
        artworkTitle={data.title}
        onSubmit={handleBidSubmit}
      />
    </>
  );
};

export default BidCard;
