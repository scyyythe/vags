import React, { useMemo, useCallback, useEffect, useState } from "react";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import useArtworks, { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { getLoggedInUserId } from "@/auth/decode";
type CreatedTabProps = {
  filteredArtworks: Artwork[];
  isLoading: boolean;
  setCreatedArtworksCount: React.Dispatch<React.SetStateAction<number>>;
};

const CreatedTab = ({ filteredArtworks, isLoading, setCreatedArtworksCount }: CreatedTabProps) => {
  const loggedInUserId = getLoggedInUserId();

  const allArtworks = useMemo(() => {
    return filteredArtworks;
  }, [filteredArtworks]);

  const createdArtworksCount = useMemo(() => {
    return allArtworks.filter((artwork) => String(artwork.artistId) === String(loggedInUserId));
  }, [allArtworks, loggedInUserId]);

  useEffect(() => {
    setCreatedArtworksCount(createdArtworksCount.length);
  }, [createdArtworksCount, setCreatedArtworksCount]);

  const handleButtonClick = useCallback((artworkId: string) => {}, []);

  if (!isLoading && allArtworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
        <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
        <p className="text-sm text-gray-500">No artworks have been created yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
      {isLoading ? (
        <ArtCardSkeleton />
      ) : allArtworks.length === 0 ? (
        <p className="text-center text-sm text-gray-500 col-span-full">No artworks found.</p>
      ) : (
        allArtworks.map((art) => {
          const isExplore = String(art.artistId) !== String(loggedInUserId);

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
            />
          );
        })
      )}
    </div>
  );
};

export default CreatedTab;
