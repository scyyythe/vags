import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { getLoggedInUserId } from "@/auth/decode";

const OnBidTab = () => {
  const loggedInUserId = getLoggedInUserId();
  const { id: visitedUserId } = useParams();
  const { data: artworks = [], isLoading } = useArtworks(1, visitedUserId, true, "specific-user");

  const onBidArtworks = artworks.filter((art) => art.status?.toLowerCase() === "onBid");

  const handleButtonClick = useCallback((artworkId: string) => {}, []);

  if (!isLoading && onBidArtworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
        <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
        <p className="text-sm text-gray-500">No artworks are currently on bid.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
      {isLoading ? (
        <ArtCardSkeleton />
      ) : (
        onBidArtworks.map((art) => {
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
        })
      )}
    </div>
  );
};

export default OnBidTab;
