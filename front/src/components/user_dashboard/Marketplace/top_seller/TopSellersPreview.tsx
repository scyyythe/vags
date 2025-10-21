import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import useTopSellers from "@/hooks/users/top_seller/useTopSellers";
import { useState, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface Seller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
}

// Component for individual seller with translation
const SellerItem = ({
  seller,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: {
  seller: any;
  onNavigate: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const { language } = useLanguage();
  const translatedName = useAutoTranslation(seller.name || "", language);

  return (
    <div className="flex-shrink-0" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onNavigate}>
      <div
        className="artist-card group cursor-pointer bg-gray-100 p-4 rounded-full shadow-lg hover:shadow-2xl transition-shadow duration-300 flex items-center space-x-3 min-w-[180px]"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-md bg-gray-300 flex items-center justify-center">
          {seller.profile_picture ? (
            <img src={seller.profile_picture} alt={translatedName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-gray-700">
              {translatedName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium">{translatedName}</span>
          <div className="flex items-center gap-1">
            <i className="bx bxs-star text-yellow-400 text-xs"></i>
            <span className="text-xs text-red-500 font-medium">{seller.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TopSellers = () => {
  const { data: sellers = [], isLoading } = useTopSellers();
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);

  // Translation hooks
  const { language } = useLanguage();
  const topSellersText = useAutoTranslation("Top Sellers", language);
  const viewAllText = useAutoTranslation("View all", language);

  const scrollingSellers = useMemo(() => {
    return Array(4).fill(sellers).flat();
  }, [sellers]);

  const handleViewAll = () => {
    navigate("/topsellers");
  };

  return (
    <div className="mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-gray-900">{topSellersText}</h2>
        <button className="text-[11px] text-gray-600 hover:text-gray-900" onClick={handleViewAll}>
          {viewAllText}
        </button>
      </div>

      {/* Sellers List */}
      <div className="relative overflow-hidden pb-4">
        <div
          className="flex animate-scroll gap-[13px] whitespace-nowrap w-max"
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {scrollingSellers.map((seller, index) => (
            <SellerItem
              key={`${seller.id}-${index}`}
              seller={seller}
              onNavigate={() => navigate(`/userprofile/${seller.id}`)}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 50s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TopSellers;
