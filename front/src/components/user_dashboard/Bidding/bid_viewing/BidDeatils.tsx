import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/user_dashboard/navbar/Header";
import RelatedBids from "@/components/user_dashboard/Bidding/bid_viewing/RelatedBids";

const BidDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [bid, setBid] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedBid");
    if (stored) {
      setBid(JSON.parse(stored));
      localStorage.removeItem("selectedBid"); //Clearing the data after viewing
    }
  }, []);
  

  if (!bid) return null;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto pt-24 px-4 md:px-12 flex flex-col md:flex-row gap-12 items-start">
        
        {/* Image */}
        <div className="flex-1 max-w-[500px] mx-auto">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img src={bid.image} alt={bid.title} className="w-full object-cover" />
          </div>
        </div>

        {/* Bid Details */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-600">
              <Heart className="text-red-500 fill-red-500" size={18} />
              <span className="text-sm">{(bid.likes / 1000).toFixed(1)}k</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <Eye size={18} />
              <span className="text-sm">{(bid.views / 1000).toFixed(1)}k</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold">{bid.title}</h1>
          <p className="text-sm text-gray-500">by {bid.artist}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{bid.description}</p>

          <div className="bg-gray-100 p-4 rounded-md flex justify-between text-center">
            <div>
              <p className="text-xs text-gray-500">Highest Bid</p>
              <p className="text-xl font-bold">{bid.highestBid}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Auction ends in</p>
              <p className="text-xl font-bold">
                {bid.timeRemaining.hrs} : {bid.timeRemaining.mins} : {bid.timeRemaining.secs}
              </p>
              <div className="text-[10px] text-gray-400 mt-1">Hrs &nbsp;&nbsp; Mins &nbsp;&nbsp; Secs</div>
            </div>
          </div>

          <Button className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded-lg">
            Place A Bid
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-12 mt-20 mb-12">
        <h2 className="text-lg font-bold mb-4">Related Artworks</h2>
        <RelatedBids currentCategory={bid.category} currentBidId={bid.id} />
      </div>
    </div>
  );
};

export default BidDetails;
