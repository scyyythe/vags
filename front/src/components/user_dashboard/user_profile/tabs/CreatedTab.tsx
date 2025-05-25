import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import useArtworks, { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { getLoggedInUserId } from "@/auth/decode";
import useBulkArtworkStatus from "@/hooks/interactions/useArtworkStatus";
type CreatedTabProps = {
  filteredArtworks: Artwork[];
  isLoading: boolean;
  filterVisibility?: string;
};

const CreatedTab = ({ filteredArtworks, isLoading, filterVisibility }: CreatedTabProps) => {
  const loggedInUserId = getLoggedInUserId();
  const artworkIds = useMemo(() => filteredArtworks.map((art) => art.id), [filteredArtworks]);

  const { data: bulkStatus, isLoading: statusLoading } = useBulkArtworkStatus(artworkIds);

  const bulkStatusLookup = React.useMemo(() => {
    if (!bulkStatus) return {};
    return bulkStatus.reduce((acc, item) => {
      acc[item.artwork_id] = item;
      return acc;
    }, {});
  }, [bulkStatus]);
  // Filter artworks based on visibility if filterVisibility is given
  const allArtworks = useMemo(() => {
    if (!filterVisibility) return filteredArtworks;
    return filteredArtworks.filter((art) => art.visibility?.toLowerCase() === filterVisibility.toLowerCase());
  }, [filteredArtworks, filterVisibility]);

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
          const isDeleted = art.visibility?.toLowerCase() === "deleted";
          const isArchived = art.visibility?.toLowerCase() === "archived";
          const status = bulkStatusLookup[art.id];
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
              isLikedFromBulk={status ? status.isLiked : false}
              isSavedFromBulk={status ? status.isSaved : false}
            />
          );
        })
      )}
    </div>
  );
};

export default CreatedTab;
