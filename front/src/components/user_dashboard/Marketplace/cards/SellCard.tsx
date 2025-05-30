import React, { useState, memo } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

export interface SellCardProps {
  id: string;
  artworkImage: string;
  price: number;
  originalPrice?: number;
  title: string;
  isMarketplace?: boolean;
}

const SellCard = ({
  id,
  artworkImage,
  price,
  originalPrice = 0,
  title,
  isMarketplace = false,
}: SellCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    toast(liked ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div 
        className="art-card h-full text-xs group animate-fadeIn rounded-xl bg-white hover:shadow-lg 
        transition-all duration-300 border border-gray-200 px-3 py-3"
    >

      {/* Artwork Image */}
      <div className="px-1 py-1">
        <img
          src={artworkImage}
          alt={title}
          className="rounded-md w-full h-44 object-cover mb-2"
        />

        <div className="flex justify-between mt-3">
            {/* Price display */}
            <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">${price}</p>
                {originalPrice > 0 && originalPrice !== price && (
                    <p className="text-xs line-through text-gray-400">${originalPrice}</p>
                )}
            </div>

            <div className="relative text-gray-500" style={{ height: "24px" }}>
            <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className={`p-1 rounded-full ${menuOpen ? "border border-gray-300 text-black" : ""}`}
            >
                <MoreHorizontal size={14} />
            </button>
            {/* Add a dropdown menu here */}
            </div>
        </div>

        <div className="flex justify-between mt-1.5">
            {/* Title */}
            <p className="text-xs font-medium mt-2 truncate" title={title}>
                {title}
            </p>

            <button className="text-white text-[10px] bg-red-800 hover:bg-red-700 transition px-4 py-1.5 rounded-full">
                Buy now
            </button>
        </div>

        {/* Optional badge for marketplace
        {isMarketplace && (
          <p className="mt-1 text-[9px] font-semibold text-red-700 uppercase">
            Marketplace Item
          </p>
        )} */}
      </div>
    </div>
  );
};

export default memo(SellCard);
