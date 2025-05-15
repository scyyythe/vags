import React, { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { getLoggedInUserId } from "@/auth/decode";
import BidCard from "../../Bidding/cards/BidCard";
import { useMyAuctionArtworks } from "@/hooks/auction/useMyAuctionArtworks";
import { ArtworkAuction } from "@/hooks/auction/useAuction";
const OnBidTab = () => {
  // Tabs state: "ongoing", "sold", or "noBidder"
  const [activeTab, setActiveTab] = useState<"on_going" | "sold" | "closed">("on_going");
  const { data: auctions = [], isLoading } = useMyAuctionArtworks(activeTab);
  // Filter artworks by status
  const ongoingAuctions: ArtworkAuction[] = auctions.filter((a) => a.status === "on_going");
  const soldAuctions: ArtworkAuction[] = auctions.filter((a) => a.status === "sold");
  const noBidderAuctions: ArtworkAuction[] = auctions.filter((a) => a.status === "closed");

  let displayedAuctions: ArtworkAuction[] = [];
  let emptyMessage = "";
  switch (activeTab) {
    case "on_going":
      displayedAuctions = ongoingAuctions;
      emptyMessage = "No artworks are currently on bid.";
      break;
    case "sold":
      displayedAuctions = soldAuctions;
      emptyMessage = "No artworks have been sold yet.";
      break;
    case "closed":
      displayedAuctions = noBidderAuctions;
      emptyMessage = "No artworks without bidders.";
      break;
  }

  return (
    <div>
      {/* Tabs Navigation */}
      <div className="flex space-x-8 text-[10px] pl-2 border-gray-300 mb-7">
        <button
          className={`pb-2 font-medium ${
            activeTab === "on_going" ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("on_going")}
          type="button"
        >
          Ongoing
        </button>
        <button
          className={`pb-2 font-medium ${
            activeTab === "sold" ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("sold")}
          type="button"
        >
          Sold
        </button>
        <button
          className={`pb-2 font-medium ${
            activeTab === "closed" ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("closed")}
          type="button"
        >
          No Bidder
        </button>
      </div>

      {isLoading ? (
        <ArtCardSkeleton />
      ) : displayedAuctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
          <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
          {displayedAuctions.map((auction) => (
            <BidCard key={auction.id} data={auction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OnBidTab;
