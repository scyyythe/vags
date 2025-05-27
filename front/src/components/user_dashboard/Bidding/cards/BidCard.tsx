import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import BidMenu from "./BidMenu";
import BidPopup from "../place_bid/BidPopup";
import CountdownTimer from "@/hooks/count/useCountdown";
import { ArtworkAuction } from "@/hooks/auction/useAuction";
import useAuctionSubmitReport from "@/hooks/mutate/report/useReportBid";
import useBidReportStatus from "@/hooks/mutate/report/useReportBidStatus";

interface ExtendedArtworkAuction extends ArtworkAuction {
  isPaid?: boolean;
  isHighestBidder?: boolean;
  joinedByCurrentUser?: boolean;
}

interface BidCardProps {
  data: ExtendedArtworkAuction;
  onClick?: () => void;
  isLoading?: boolean;
  onPlaceBid?: (id: string, amount: number) => void;
  user?: {
    username: string;
    first_name: string;
    last_name: string;
  };
}

const BidCard: React.FC<BidCardProps> = ({ data, isLoading = false, onPlaceBid, onClick, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showBidPopup, setShowBidPopup] = useState(false);
  const { data: reportStatusData } = useBidReportStatus(data.id);
  const isReported = reportStatusData?.reported === true;

  const navigate = useNavigate();
  const { mutate: submitAuctionReport } = useAuctionSubmitReport();

  useEffect(() => {
    console.log("Top level start_bid_amount:", data.start_bid_amount);
  }, [data]);

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
  };

  const handleHide = () => {
    setIsHidden(true);
    toast("Artwork hidden");
    setMenuOpen(false);
  };

  const handleReport = (issueDetails: string) => {
    if (reportStatusData?.reported) {
      toast.error("You have already reported this artwork.");
      setMenuOpen(false);
      return;
    }
    submitAuctionReport({ id: data.id, issue_details: issueDetails });
    setMenuOpen(false);
  };

  const handleBidSubmit = (amount: number) => {
    onPlaceBid?.(data.id, amount);
    toast(`Bid of ${amount}K placed successfully!`);
  };

  if (isHidden) return null;

  const hasWon = data.isHighestBidder && data.isPaid;

  return (
    <>
      <div
        onClick={onClick}
        className="w-full rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer"
      >
        <div className="relative">
          <img 
            src={data.artwork.image_url} 
            alt={data.artwork.title} 
            className="w-full h-56 object-cover" 
          />
          
          {/* Countdown Timer */}
          <div className="absolute top-1 left-28 whitespace-nowrap">
            <CountdownTimer targetTime={data.end_time} />
          </div>

          {/* Three dots menu */}
          <div className="absolute top-4 right-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="relative top-1.5 right-1 p-1 rounded-full text-black bg-white bg-opacity-60 hover:bg-opacity-40"
            >
              <MoreHorizontal size={13} />
            </button>
            <BidMenu isOpen={menuOpen} onHide={handleHide} onReport={handleReport} isReported={isReported} />
          </div>

          {/* Bottom overlay with title, current bid and button */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-white bg-opacity-60 backdrop-blur-[3px] h-[69px] px-6 flex items-center justify-between rounded-lg">
              <div className="flex flex-col justify-center">
                <h2 className="text-sm font-semibold">{data.artwork.title}</h2>
                  <div className="text-gray-700 text-[9px]">
                    {hasWon ? "Your Bid" : "Current Bid"}{" "}
                    <span className="text-black text-sm font-bold ml-2">
                      {data.highest_bid?.amount
                        ? data.highest_bid.amount >= 1000
                          ? `${(data.highest_bid.amount / 1000).toFixed(data.highest_bid.amount % 1000 === 0 ? 0 : 1)}k`
                          : data.highest_bid.amount
                        : "0"}
                    </span>
                  </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasWon) {
                    navigate(`/bid-winner/${data.id}`);
                  } else {
                    setShowBidPopup(true);
                  }
                }}
                className="bg-red-800 hover:bg-red-700 text-white text-[9px] px-5 py-1.5 rounded-full font-normal transition-colors"
              >
                {hasWon ? "Claim" : "Place A Bid"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <BidPopup
        isOpen={showBidPopup}
        onClose={() => setShowBidPopup(false)}
        data={data}
        artworkId={data.artwork.id}
        artworkTitle={data.artwork.title}
        username={user?.username || "Unknown"}
        fullName={`${user?.first_name || "Unknown"} ${user?.last_name || ""}`}
        start_bid_amount={data.start_bid_amount}
      />
    </>
  );
};

export default memo(BidCard);
