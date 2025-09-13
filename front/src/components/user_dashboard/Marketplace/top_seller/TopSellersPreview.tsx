import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import useTopSellers from "@/hooks/users/top_seller/useTopSellers";
import { useState, useMemo } from "react";

interface Seller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
}

const TopSellers = () => {
  const { data: sellers = [], isLoading } = useTopSellers();
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);

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
        <h2 className="text-xs font-semibold text-gray-900">Top Sellers</h2>
        <button
          className="text-[11px] text-gray-600 hover:text-gray-900"
          onClick={handleViewAll}
        >
          View all
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
            <div
              key={`${seller.id}-${index}`}
              className="flex-shrink-0"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onClick={() => navigate(`/userprofile/${seller.id}`)}
            >
              <div
                className="bg-white rounded-full px-4 py-2.5 shadow-md min-w-[140px] 
                          cursor-pointer transform transition-all duration-500 ease-out 
                          hover:scale-105 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-7 h-7 shadow-2xl">
                    <AvatarImage
                      src={seller.avatar}
                      alt={seller.name}
                      className="object-cover"
                    />
                    <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[10px] text-gray-900 truncate">
                      {seller.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <i className="bx bxs-star text-yellow-400 text-xs"></i>
                      <span className="relative top-[1px] text-[10px] text-red-600 font-medium">
                        {seller.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
