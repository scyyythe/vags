import React, { useState, memo } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

export interface SellCardProps {
  id: string;
  artworkImage: string;
  price: number;
  originalPrice?: number;
  title: string;
  rating?: number; // Optional
  isLiked?: boolean;
  onLike?: () => void;
  isMarketplace?: boolean;
}

const SellCard = ({
  id,
  artworkImage,
  price,
  originalPrice = 0,
  title,
  rating,
  isLiked = false, 
  onLike, 
  isMarketplace = false,
}: SellCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    toast(!liked ? "Added to wishlist" : "Removed from wishlist");
  };

  return (
    <div className="art-card h-full text-xs group animate-fadeIn rounded-xl bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 px-3 py-3">
      {/* Artwork Image with Heart and Rating */}
      <div className="relative">
        <img
          src={artworkImage}
          alt={title}
          className="rounded-md w-full h-44 object-cover"
        />

        {/* Heart Icon (Top-Right) */}
        <button
          onClick={() => {
            onLike?.();
             toggleLike();
          }}
          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
        >
        <img
            src={
                liked
                ? "https://img.icons8.com/puffy-filled/32/B10303/like.png"
                : "https://img.icons8.com/puffy/32/like.png"
            }
            alt="Heart"
            className="w-3 h-3"
        />
        </button>

        {/* Rating Star (Bottom-Right) */}
        {rating !== undefined && (
            <div className="absolute bottom-2 right-2 bg-white font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                <i className="bx bxs-star text-[10px] text-yellow-500"></i>
                <span className="text-red-800 text-[9px]">{rating.toFixed(1)}</span>
            </div>
        )}
      </div>

      {/* Price and Menu */}
      <div className="flex justify-between mt-3 items-center">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-gray-900">₱{price}k</p>
          {originalPrice > 0 && originalPrice !== price && (
            <p className="text-xs line-through text-gray-400">₱{originalPrice}k</p>
          )}
        </div>

        <div className="relative text-gray-500" style={{ height: "24px" }}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`p-1 rounded-full ${menuOpen ? " text-black" : ""}`}
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Title and Buy Now Button */}
      <div className="flex justify-between mt-1.5 items-center">
        <p className="text-[11px] font-medium mt-0.5 truncate" title={title}>
          {title}
        </p>
        <button className="text-white text-[9px] bg-red-800 hover:bg-red-700 transition px-4 py-1.5 rounded-full">
          Buy Now
        </button>
      </div>

       {/* Optional badge for marketplace
        {isMarketplace && (
          <p className="mt-1 text-[9px] font-semibold text-red-700 uppercase">
            Marketplace Item
          </p>
        )} */}
    </div>
  );
};

export default memo(SellCard);
