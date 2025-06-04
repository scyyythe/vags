import React, { useState, memo } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import SellCardMenu from "./SellCardMenu"; 

export interface SellCardProps {
  id: string;
  artworkImage: string;
  price: number;
  originalPrice?: number;
  title: string;
  edition?: string;
  rating?: number;
  isLiked?: boolean;
  onLike?: () => void;
  isMarketplace?: boolean;
  onCardClick?: () => void;
}

const SellCard = ({
  id,
  artworkImage,
  price,
  originalPrice = 0,
  title,
  edition,
  rating,
  isLiked = false,
  onLike,
  isMarketplace = false,
  onCardClick,
}: SellCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    toast(!isLiked ? "Added to wishlist" : "Removed from wishlist");
    onLike?.();
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    toast("Redirecting to contact the artist...");
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setMenuOpen(!menuOpen);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleReport = (data: {
    category: string;
    option?: string;
    description: string;
    additionalInfo: string;
  }) => {
    console.log("Report submitted:", data);
    toast("Report submitted. Thank you!");
  };

  return (
    <div 
    onClick={onCardClick}
    className="sell-card h-full text-xs group animate-fadeIn rounded-xl bg-white hover:shadow-lg 
    transition-all duration-300 border border-gray-200 px-3 py-3 relative cursor-pointer">
      <div className="relative">
        <img
          src={artworkImage}
          alt={title}
          className="rounded-md w-full h-44 object-cover"
        />

        {/* Message Icon */}
        <button
          onClick={handleContact}
          className="absolute top-2 right-9 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
        >
          <img
            src="https://img.icons8.com/?size=100&id=8h51YOzhBJmT&format=png&color=000000"
            alt="Message"
            className="w-3 h-3"
          />
        </button>

        {/* Wishlist Icon */}
        <button
          onClick={toggleLike}
          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
        >
          <img
            src={
              isLiked
                ? "https://img.icons8.com/puffy-filled/32/B10303/like.png"
                : "https://img.icons8.com/puffy/32/like.png"
            }
            alt="Heart"
            className="w-3 h-3"
          />
        </button>

        {edition !== "Original (1 of 1)" && rating !== undefined && (
          <div className="absolute bottom-2 right-2 bg-white font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
            <i className="bx bxs-star text-[10px] text-yellow-500"></i>
            <span className="text-red-800 text-[9px]">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-3 items-center">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-gray-900">₱{price}k</p>
          {originalPrice > 0 && originalPrice !== price && (
            <p className="text-xs line-through text-gray-400">₱{originalPrice}k</p>
          )}
        </div>

        <div className="relative text-gray-500" style={{ height: "24px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className={`p-1 rounded-full ${menuOpen ? " text-black" : ""}`}
          >
            <MoreHorizontal size={14} />
          </button>

          {/* Render Menu */}
          <SellCardMenu
            isOpen={menuOpen}
            onReport={handleReport}
            isReported={false}
          />
        </div>
      </div>

      <div className="flex justify-between mt-1.5 items-center">
        <p className="text-[11px] font-medium mt-0.5 truncate" title={title}>
          {title}
        </p>
        <button 
        onClick={handleBuyNow}
        className="text-white text-[9px] bg-red-800 hover:bg-red-700 transition px-4 py-1.5 rounded-full">
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default memo(SellCard);
