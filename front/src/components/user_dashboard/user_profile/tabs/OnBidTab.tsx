import React, { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { getLoggedInUserId } from "@/auth/decode";

const OnBidTab = () => {
  const loggedInUserId = getLoggedInUserId();
  const { id: visitedUserId } = useParams();
  const { data: artworks = [], isLoading } = useArtworks(1, visitedUserId, true, "specific-user");

  // Tabs state: "ongoing", "sold", or "noBidder"
  const [activeTab, setActiveTab] = useState<"ongoing" | "sold" | "noBidder">("ongoing");

  // Filter artworks by status
  const ongoingArtworks = artworks.filter(art => art.status?.toLowerCase() === "onbid");
  const soldArtworks = artworks.filter(art => art.status?.toLowerCase() === "sold");
  const noBidderArtworks = artworks.filter(art => art.status?.toLowerCase() === "nobidder");

  const handleButtonClick = useCallback((artworkId: string) => {
    // Your existing button click logic here
  }, []);

  // Select artworks to display based on active tab
  let displayedArtworks = [];
  let emptyMessage = "";
  switch (activeTab) {
    case "ongoing":
      displayedArtworks = ongoingArtworks;
      emptyMessage = "No artworks are currently on bid.";
      break;
    case "sold":
      displayedArtworks = soldArtworks;
      emptyMessage = "No artworks have been sold yet.";
      break;
    case "noBidder":
      displayedArtworks = noBidderArtworks;
      emptyMessage = "No artworks without bidders.";
      break;
  }

  return (
    <div>
      {/* Tabs Navigation */}
      <div className="flex space-x-8 text-[10px] pl-2 border-gray-300 mb-7">
        <button
          className={`pb-2 font-medium ${
            activeTab === "ongoing" ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("ongoing")}
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
            activeTab === "noBidder" ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("noBidder")}
          type="button"
        >
          No Bidder
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <ArtCardSkeleton />
      ) : displayedArtworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
          <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
          {displayedArtworks.map((art) => {
            const isExplore = String(art.artistId) !== String(loggedInUserId);
            const isDeleted = art.visibility?.toLowerCase() === "deleted";
            const isArchived = art.visibility?.toLowerCase() === "archived";

            return (
              <ArtCard
                key={art.id}
                id={art.id}
                artistName={art.artistName}
                artistId={art.artistId}
                artistImage={art.artistImage || ""}
                artworkImage={art.artworkImage}
                title={art.title}
                onButtonClick={() => handleButtonClick(art.id)}
                isExplore={isExplore}
                likesCount={art.likesCount ?? 0}
                isDeleted={isDeleted}
                isArchived={isArchived}
                visibility={art.visibility}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OnBidTab;
