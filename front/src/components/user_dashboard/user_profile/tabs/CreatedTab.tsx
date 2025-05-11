import React, { useState, useEffect, useMemo, useCallback } from "react";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import useArtworks, { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";

type CreatedTabProps = {
  filteredArtworks: Artwork[];
  isLoading: boolean;
};
const CreatedTab = ({ filteredArtworks, isLoading }: CreatedTabProps) => {
  const handleButtonClick = useCallback((artworkId: string) => {
    console.log(`Button clicked for artwork ID: ${artworkId}`);
  }, []);

  const publicArtworks = useMemo(() => {
    return filteredArtworks.filter(
      (artwork) =>
        artwork.visibility === "Public" ||
        artwork.visibility === "public" ||
        artwork.visibility === "private" ||
        artwork.visibility === "Private"
    );
  }, [filteredArtworks]);

  if (!isLoading && publicArtworks.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500 col-span-full">You have not created any public artwork yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
      {isLoading ? (
        <ArtCardSkeleton />
      ) : (
        publicArtworks.map((art: Artwork) => (
          <ArtCard
            key={art.id}
            id={art.id}
            artistName={art.artistName}
            artistId={art.artist_id}
            artistImage={art.artistImage || ""}
            artworkImage={art.artworkImage}
            title={art.title}
            onButtonClick={() => handleButtonClick(art.id)}
            isExplore={false}
            likesCount={art.likesCount ?? 0}
          />
        ))
      )}
    </div>
  );
};

export default CreatedTab;
