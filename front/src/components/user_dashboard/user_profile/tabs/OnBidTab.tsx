import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { getLoggedInUserId } from "@/auth/decode";
import BidCard from "../../Bidding/cards/BidCard";
import useAuctions, { ArtworkAuction } from "@/hooks/auction/useAuction";

type ExtendedAuction = ArtworkAuction & { 
  isPaid?: boolean; 
  joinedByCurrentUser?: boolean; 
};

const OnBidTab = () => {
  const [activeTab, setActiveTab] = useState<"on_going" | "sold" | "closed" | "joined_bids" | "winning_bids">("on_going");
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const { id: visitedUserId } = useParams();
  const loggedInUserId = getLoggedInUserId();
  const isMyProfile = !visitedUserId || visitedUserId === loggedInUserId;

  const { data: auctions = [], isLoading } = useAuctions(
    1,
    isMyProfile ? loggedInUserId : visitedUserId,
    true,
    isMyProfile ? "created-by-me" : "specific-user"
  );

  // Filtering logic based on activeTab
  const filteredAuctions = (auctions as ExtendedAuction[]).filter((a) => {
    if (activeTab === "joined_bids") {
      return a.joinedByCurrentUser === true;
    }
    if (activeTab === "winning_bids") {
      return a.isPaid === true;
    }
    return a.status === activeTab;
  });

  const tabEmptyMessages = {
    on_going: "No artworks are currently on bid.",
    sold: "No artworks have been sold yet.",
    closed: "No artworks without bidders.",
    joined_bids: "You haven't joined any auctions yet.",
    confirmed_bids: "You haven't confirmed any bids yet.",
  };

  const handleBidClick = (artwork: ArtworkAuction) => {
    localStorage.setItem("selectedBid", JSON.stringify(artwork));
    navigate(`/bid/${artwork.id}/`, { state: { artwork } });
  };

  return (
    <div>
      {/* Tabs */}
      <div className="relative flex space-x-8 text-[10px] pl-2 border-gray-300 mb-7">
        {["on_going", "sold", "closed"].map((tab) => (
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

        {/* JOINED BIDS / CONFIRMED BIDS Tab */}
        <div className="relative flex items-center space-x-1">
          {/* Label button toggles to joined_bids */}
          <button
            className={`pb-2 font-medium ${
              (activeTab === "joined_bids" || activeTab === "winning_bids")
                ? "border-b-2 border-red-800 text-red-800"
                : "text-gray-600"
            }`}
            onClick={() => {
              setActiveTab("joined_bids");
              setShowDropdown(false);
            }}
          >
            {activeTab === "winning_bids" ? "WINNING BIDS" : "JOINED BIDS"}
          </button>

          {/* Chevron icon opens dropdown only if joined_bids or confirmed_bids */}
          <button
            className="pb-2"
            onClick={() => {
              if (activeTab === "joined_bids" || activeTab === "winning_bids") {
                setShowDropdown((prev) => !prev);
              }
            }}
          >
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

          {/* Dropdown menu */}
          {(activeTab === "joined_bids" || activeTab === "winning_bids") && showDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-full z-10 text-[10px]">
              <button
                className={`block px-4 py-2 text-left w-full whitespace-nowrap ${
                  activeTab === "winning_bids" ? "text-black" : ""
                }`}
                onClick={() => {
                  setActiveTab(activeTab === "joined_bids" ? "winning_bids" : "joined_bids");
                  setShowDropdown(false);
                }}
              >
                {activeTab === "joined_bids" ? "WINNING BIDS" : "JOINED BIDS"}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Content */}
      {isLoading ? (
        <ArtCardSkeleton />
      ) : filteredAuctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
          <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
          <p className="text-xs text-gray-500">{tabEmptyMessages[activeTab]}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filteredAuctions.map((auction) => (
            <BidCard key={auction.id} data={auction} onClick={() => handleBidClick(auction)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OnBidTab;
