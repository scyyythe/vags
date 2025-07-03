import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useTopSellers from "@/hooks/users/top_seller/useTopSellers";
interface Seller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
}

const TopSellers = () => {
  // const sellers: Seller[] = [
  //   {
  //     id: "1",
  //     name: "Angel Canete",
  //     avatar: "https://i.pinimg.com/736x/b7/0c/8b/b70c8b258dfa7e7818f81cb844104802.jpg",
  //     rating: 5.0
  //   },
  //   {
  //     id: "2", 
  //     name: "Jera Bartolome",
  //     avatar: "https://i.pinimg.com/736x/6f/64/66/6f64669d94c9bcb69991370d0c61e7bf.jpg",
  //     rating: 5.0
  //   },
  //   {
  //     id: "3",
  //     name: "Jim Boy", 
  //     avatar: "https://i.pinimg.com/736x/bd/ef/91/bdef91c15730797da13c828fea7c6740.jpg",
  //     rating: 5.0
  //   },
  //   {
  //     id: "4",
  //     name: "James Reid",
  //     avatar: "https://i.pinimg.com/736x/05/c7/09/05c7095e4c413c8124c5ae472c5fac3c.jpg", 
  //     rating: 5.0
  //   },
  //   {
  //     id: "5",
  //     name: "Gen Rosa",
  //     avatar: "https://i.pinimg.com/736x/45/d6/52/45d652161607a6a6ef21fbdf1630eba7.jpg",
  //     rating: 5.0
  //   },
  //   {
  //     id: "6",
  //     name: "Jandeb Lap",
  //     avatar: "https://i.pinimg.com/736x/1a/4c/9b/1a4c9bb74952253e2542aaa434ad6df9.jpg",
  //     rating: 5.0
  //   },
  //   {
  //     id: "7",
  //     name: "Glendon Tar",
  //     avatar: "https://i.pinimg.com/736x/64/7e/ca/647ecaf678c17c2a2ed27b3e8d233692.jpg", 
  //     rating: 5.0
  //   },
  //   {
  //     id: "8",
  //     name: "Jam Bot",
  //     avatar: "https://i.pinimg.com/736x/31/a1/5a/31a15aeee5ad89b29c869d3e5a10be3f.jpg", 
  //     rating: 5.0
  //   },
  // ];
 const { data: sellers = [], isLoading } = useTopSellers();

  const navigate = useNavigate();
  const scrollingSellers = useMemo(() => [...sellers, ...sellers], []);

   const handleViewAll = () => {
    navigate("/topsellers"); 
  };

  return (
    <div className="mb-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-gray-900">Top Sellers</h2>
        <button 
        className="text-[11px] text-gray-600 hover:text-gray-900"  
        onClick={handleViewAll}>
          
          View all
        </button>
      </div>

      <div className="relative overflow-hidden pb-4">
        <div className="flex animate-scroll gap-[13px] whitespace-nowrap w-max">
          {scrollingSellers.map((seller, index) => (
            <div key={`${seller.id}-${index}`} className="flex-shrink-0">
              <div className="bg-white rounded-full px-4 py-2.5 shadow-md min-w-[140px] hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <Avatar className="w-7 h-7 shadow-2xl">
                    <AvatarImage src={seller.avatar} alt={seller.name} className="object-cover" />
                    <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[10px] text-gray-900 truncate">{seller.name}</h3>
                    <div className="flex items-center gap-1">
                      <i className='bx bxs-star text-yellow-400 text-xs'></i>
                      <span className="relative top-[1px] text-[10px] text-red-600 font-medium">{seller.rating}</span>
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
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TopSellers;
