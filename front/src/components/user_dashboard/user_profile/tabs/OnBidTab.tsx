import React, { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { getLoggedInUserId } from "@/auth/decode";
import BidCard from "../../Bidding/cards/BidCard";
import useAuctions, { ArtworkAuction } from "@/hooks/auction/useAuction";
import { useNavigate } from "react-router-dom";

const OnBidTab = () => {
  const [activeTab, setActiveTab] = useState<"on_going" | "sold" | "closed">("on_going");
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

  const filteredAuctions = auctions.filter((a) => a.status === activeTab);

  const tabEmptyMessages = {
    on_going: "No artworks are currently on bid.",
    sold: "No artworks have been sold yet.",
    closed: "No artworks without bidders.",
  };
  const handleBidClick = (artwork: ArtworkAuction) => {
    localStorage.setItem("selectedBid", JSON.stringify(artwork));
    navigate(`/bid/${artwork.id}/ `, {
      state: { artwork },
    });
  };
  return (
    <div>
      {/* Tabs */}
      <div className="flex space-x-8 text-[10px] pl-2 border-gray-300 mb-7">
        {["on_going", "sold", "closed"].map((tab) => (
          <button
            key={tab}
            className={`pb-2 font-medium ${
              activeTab === tab ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
            }`}
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab.replace("_", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ArtCardSkeleton />
      ) : filteredAuctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
          <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
          <p className="text-sm text-gray-500">{tabEmptyMessages[activeTab]}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 border">
          {filteredAuctions.map((auction) => (
            <BidCard key={auction.id} data={auction} onClick={() => handleBidClick(auction)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OnBidTab;
