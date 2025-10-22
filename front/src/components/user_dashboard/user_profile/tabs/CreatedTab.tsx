import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import useArtworks, { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";
import ArtCardSkeleton from "@/components/skeletons/artworks/ArtCardSkeleton";
import { getLoggedInUserId } from "@/auth/decode";
import useBulkArtworkStatus from "@/hooks/interactions/useArtworkStatus";
import useBulkReportStatus from "@/hooks/mutate/report/useReportStatus";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

type CreatedTabProps = {
  filteredArtworks: Artwork[];
  isLoading: boolean;
  selectedStatus?: string;
};

const CreatedTab = ({ filteredArtworks, isLoading, selectedStatus = "Active" }: CreatedTabProps) => {
  const loggedInUserId = getLoggedInUserId();
  const { language } = useLanguage();
  
  // Translation hooks
  const noArtworksCreatedText = useAutoTranslation("No artworks have been created yet.", language);
  const noArtworksFoundText = useAutoTranslation("No artworks found.", language);
  
  const artworkIds = useMemo(() => filteredArtworks.map((art) => art.id), [filteredArtworks]);

  const { data: bulkStatus, isLoading: statusLoading } = useBulkArtworkStatus(artworkIds);
  const { data: reportStatus } = useBulkReportStatus(artworkIds);

  const bulkStatusLookup = React.useMemo(() => {
    if (!bulkStatus) return {};
    return bulkStatus.reduce((acc, item) => {
      acc[item.artwork_id] = item;
      return acc;
    }, {});
  }, [bulkStatus]);

  const reportStatusLookup = reportStatus || {};

  const allArtworks = useMemo(() => {
    // ProfileTabs.tsx already handles all the filtering, so we just return the filtered artworks
    return filteredArtworks;
  }, [filteredArtworks]);

  const handleButtonClick = useCallback((artworkId: string) => {}, []);

  if (!isLoading && allArtworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
        <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
        <p className="text-sm text-gray-500">{noArtworksCreatedText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
      {isLoading ? (
        <ArtCardSkeleton />
      ) : allArtworks.length === 0 ? (
        <p className="text-center text-sm text-gray-500 col-span-full">{noArtworksFoundText}</p>
      ) : (
        allArtworks.map((art) => {
          const isExplore = String(art.artistId) !== String(loggedInUserId);
          const isDeleted = art.visibility?.toLowerCase() === "deleted";
          const isArchived = art.visibility?.toLowerCase() === "archived";
          const status = bulkStatusLookup[art.id];
          const report = reportStatusLookup[art.id];
          return (
            <ArtCard
              key={art.id}
              artwork={art}
              status={status}
              report={report}
              onButtonClick={() => handleButtonClick(art.id)}
              isExplore={isExplore}
              isDeleted={isDeleted}
              isArchived={isArchived}
              visibility={selectedStatus?.toLowerCase() === "hidden" ? "hidden" : art.visibility}
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
