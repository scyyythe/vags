import React, { useState,useMemo,useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { getLoggedInUserId } from "@/auth/decode";
import BidCard from "../../Bidding/cards/BidCard";
import useAuctions, { ArtworkAuction } from "@/hooks/auction/useAuction";

type ExtendedAuction = ArtworkAuction & {
  isPaid?: boolean;
  joinedByCurrentUser?: boolean;
  isHighestBidder?: boolean;
  isLost?: boolean;
};

type MyBidFilter = "all" | "active" | "won" | "lost";

const OnBidTab = () => {
  const [activeTab, setActiveTab] = useState<"on_going" | "sold" | "closed" | "my_bids">("on_going");
  const [myBidFilter, setMyBidFilter] = useState<MyBidFilter>("all");
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const { id: visitedUserId } = useParams();
  const loggedInUserId = getLoggedInUserId();
  const isMyProfile = !visitedUserId || visitedUserId === loggedInUserId;
const {
  data: participatedAuctions = [],
  isLoading: isLoadingParticipated,
} = useAuctions(1, loggedInUserId, true, "participated");

const {
  data: auctions = [],
  isLoading: isLoadingAuctions,
} = useAuctions(
  1,
  isMyProfile ? loggedInUserId : visitedUserId,
  true,
  isMyProfile ? "created-by-me" : "specific-user"
);

const participatedAuctionsWithFlags = useMemo(() => {
  return participatedAuctions.map((auction) => {
    const isHighestBidder = auction.highest_bid?.user?.id === loggedInUserId;
    const joinedByCurrentUser = auction.bid_history?.some((bid) => bid.user?.id === loggedInUserId) ?? false;
    const isPaid = auction.status === "sold" && isHighestBidder;
    const isLost = !isHighestBidder && (auction.status === "sold" || auction.status === "closed");

    return {
      ...auction,
      isHighestBidder,
      joinedByCurrentUser,
      isPaid,
      isLost,
    };
  });
}, [participatedAuctions, loggedInUserId]);


  const auctionsToDisplay: ExtendedAuction[] =
    activeTab === "my_bids" ? participatedAuctionsWithFlags : (auctions as ExtendedAuction[]);

  const filteredAuctions = auctionsToDisplay.filter((a) => {
    if (activeTab === "my_bids") {
      if (!a.joinedByCurrentUser) return false;

      switch (myBidFilter) {
        case "active":
          return a.isHighestBidder && a.status === "on_going";
        case "won":
          return a.isHighestBidder && a.status === "sold" && a.isPaid;
        case "lost":
          return a.isLost;
        case "all":
        default:
          return true;
      }
    }

    return a.status === activeTab;
  });

  const tabEmptyMessages = {
    on_going: "No artworks are currently on bid.",
    sold: "No artworks have been sold yet.",
    closed: "No artworks without bidders.",
    my_bids: {
      all: "You haven't joined any auctions yet.",
      active: "No active winning bids.",
      won: "No confirmed bids yet.",
      lost: "You haven't lost any auctions yet.",
    },
  };

const handleBidClick = useCallback((artwork: ArtworkAuction) => {
  localStorage.setItem("selectedBid", JSON.stringify(artwork));
  navigate(`/bid/${artwork.id}/`, { state: { artwork } });
}, [navigate]);


  return (
    <div>
      {/* Tabs */}{" "}
      <div className="relative flex space-x-8 text-[10px] pl-2 border-gray-300 mb-7">
        {["on_going", ...(isMyProfile ? ["sold", "closed"] : [])].map((tab) => (
          <button
            key={tab}
            className={`pb-2 font-medium ${
              activeTab === tab ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
            }`}
            onClick={() => {
              setActiveTab(tab as typeof activeTab);
              setShowDropdown(false);
            }}
          >
            {tab.replace("_", " ").toUpperCase()}
          </button>
        ))}

        {/* MY BIDS tab only for own profile */}
        {isMyProfile && (
          <div className="relative flex items-center space-x-1">
            <button
              className={`pb-2 font-medium ${
                activeTab === "my_bids" ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
              }`}
              onClick={() => {
                setActiveTab("my_bids");
                setShowDropdown(false);
                setMyBidFilter("all");
              }}
            >
              MY BIDS ({myBidFilter.toUpperCase()})
            </button>

            {activeTab === "my_bids" && (
              <button className="pb-2" onClick={() => setShowDropdown((prev) => !prev)}>
                <svg
                  className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : "rotate-0"}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {activeTab === "my_bids" && showDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded shadow z-10 text-[10px]">
                {(["all", "active", "won", "lost"] as MyBidFilter[]).map((option) => (
                  <button
                    key={option}
                    className={`block px-4 py-2 text-left w-full whitespace-nowrap ${
                      myBidFilter === option ? "font-semibold text-black" : "text-gray-600"
                    }`}
                    onClick={() => {
                      setMyBidFilter(option);
                      setShowDropdown(false);
                    }}
                  >
                    {option.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Content */}
   {(activeTab === "my_bids" ? isLoadingParticipated : isLoadingAuctions) ? (
        <ArtCardSkeleton />
      ) : filteredAuctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
          <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
          <p className="text-xs text-gray-500">
            {activeTab === "my_bids" ? tabEmptyMessages.my_bids[myBidFilter] : tabEmptyMessages[activeTab]}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filteredAuctions.map((auction) => (
            <BidCard key={auction.id} data={auction} onClick={() => handleBidClick(auction)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OnBidTab;
