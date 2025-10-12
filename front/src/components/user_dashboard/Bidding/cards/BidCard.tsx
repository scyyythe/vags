import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import BidMenu from "./BidMenu";
import BidPopup from "../place_bid/BidPopup";
import CountdownTimer from "@/hooks/count/useCountdown";
import { ArtworkAuction } from "@/hooks/auction/useAuction";
import useAuctionSubmitReport from "@/hooks/mutate/report/useReportBid";
import { formatNumber } from "@/utils/numberFormat";
import OwnerBidMenu from "../../own_profile/menu/bid_card/Menu";
import { getLoggedInUserId } from "@/auth/decode";
import { useAuctionActions } from "@/hooks/auction/useAuctionActions";
import { useToggleHideAuction } from "@/hooks/auction/useToggleHideAuction";
interface ExtendedArtworkAuction extends ArtworkAuction {
  isPaid?: boolean;
  isHighestBidder?: boolean;
  joinedByCurrentUser?: boolean;
}

interface BidCardProps {
  data: ExtendedArtworkAuction;
  reportInfo?: {
    reported: boolean;
    status: "Pending" | "In Progress" | "Resolved" | null;
  };
  onClick?: () => void;
  isLoading?: boolean;
  onPlaceBid?: (id: string, amount: number) => void;
  user?: {
    username: string;
    first_name: string;
    last_name: string;
  };
  isHidden?: boolean;
}

const BidCard: React.FC<BidCardProps> = ({
  data,
  reportInfo,
  isLoading = false,
  onPlaceBid,
  onClick,
  user,
  isHidden: isHiddenProp = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBidPopup, setShowBidPopup] = useState(false);
  const loggedInUserId = getLoggedInUserId();
  const isOwner = data?.artwork?.artist_id === loggedInUserId;
  const { closeAuction, deleteAuction } = useAuctionActions();
  const navigate = useNavigate();
  const { mutate: submitAuctionReport } = useAuctionSubmitReport();
  const { mutate: hideAuction } = useToggleHideAuction();

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
  }

  const handleHide = () => {
    hideAuction(data.id);
    setMenuOpen(false);
  };

  const handleReport = ({
    category,
    option,
    description,
    additionalInfo,
  }: {
    category: string;
    option?: string;
    description?: string;
    additionalInfo?: string;
  }) => {
    if (reportInfo?.reported) {
      toast.error("You have already reported this auction.", { closeButton: true });
      setMenuOpen(false);
      return;
    }

    console.log("Submitting auction report with data:", {
      auction_id: data.id,
      category,
      option,
      description,
      additionalInfo,
    });

    submitAuctionReport({
      auction_id: data.id,
      category,
      option,
      description,
      additionalInfo,
    });

    setMenuOpen(false);
  };

  const isReported = reportInfo?.reported || false;

  const handleBidSubmit = (amount: number) => {
    onPlaceBid?.(data.id, amount);
    toast(`Bid of ${amount}K placed successfully!`, { closeButton: true });
  };

  const hasWon = data.isHighestBidder && data.isPaid;

  return (
    <>
      <div
        onClick={onClick}
        className="w-full rounded-xl bg-white hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        <div className="relative">
          <img src={data.artwork.image_url} alt={data.artwork.title} className="w-full h-56 object-cover rounded-xl" />

          {/* Auction Timer Display */}
          <div className="absolute top-0.5 left-4">
            {new Date() < new Date(data.start_time) ? (
              <div className="absolute top-3.5 left-0 whitespace-nowrap">
                {/* Incoming auction timer only */}
                <div className="text-gray-600 text-left bg-white bg-opacity-60 text-[9px] px-3 py-1 rounded-[5px]">
                  <p className="text-[9px]">Auction will start on</p>
                  <p className="text-[10px] font-semibold text-black mt-0.5">
                    {new Date(data.start_time).toLocaleString("en-PH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="absolute top-1 left-24 whitespace-nowrap">
                {/* Active auction countdown */}
                <CountdownTimer startTime={data.start_time} targetTime={data.end_time} />
              </div>
            )}
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
            {isOwner ? (
              <OwnerBidMenu
                isOpen={menuOpen}
                onDelete={async () => {
                  try {
                    await deleteAuction.mutateAsync(data.id);
                  } catch {
                  } finally {
                    setMenuOpen(false);
                  }
                }}
                onCloseBid={async () => {
                  try {
                    await closeAuction.mutateAsync(data.id);
                  } catch {
                    toast.error("Failed to close bidding");
                  } finally {
                    setMenuOpen(false);
                  }
                }}
                onViewBids={() => {
                  setMenuOpen(false);
                }}
                bids={data.bid_history || []}
                className="top-8 -left-[12px]"
              />
            ) : (
              <BidMenu
                isOpen={menuOpen}
                onHide={handleHide}
                onReport={handleReport}
                isReported={isReported}
                isHidden={isHiddenProp}
                auctionId={data.id}
                className="top-8 -left-[12px]"
              />
            )}
          </div>

          {/* Bottom overlay with title, current bid and button */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-white bg-opacity-60 backdrop-blur-[3px] h-[69px] px-6 flex items-center justify-between rounded-lg">
              <div className="flex flex-col justify-center">
                <h2 className="text-xs font-semibold truncate max-w-[100px]" title={data.artwork.title}>
                  {data.artwork.title}
                </h2>

                <div className="text-gray-700 text-[9px]">
                  {hasWon ? "Your Bid" : "Current Bid"}{" "}
                  <span className="text-black text-sm font-bold ml-2">
                    {data.highest_bid?.amount ? formatNumber(data.highest_bid.amount) : "0"}
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
