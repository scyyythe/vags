import React, { useMemo, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import ArtCardSkeleton from "@/components/skeletons/artworks/ArtCardSkeleton";
import { getLoggedInUserId } from "@/auth/decode";
import useSavedArtworks from "@/hooks/artworks/fetch_artworks/useSavedArtworks";
import useBulkArtworkStatus from "@/hooks/interactions/useArtworkStatus";
import useBulkReportStatus from "@/hooks/mutate/report/useReportStatus";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

type CollectionTabProps = {
  setSavedArtworksCount?: React.Dispatch<React.SetStateAction<number>>;
  selectedStatus?: string;
};

const CollectionTab = ({ setSavedArtworksCount, selectedStatus }: CollectionTabProps) => {
  const loggedInUserId = getLoggedInUserId();
  const { id: visitedUserId } = useParams();
  const isOwnProfile = !visitedUserId || visitedUserId === loggedInUserId;
  const targetUserId = isOwnProfile ? undefined : visitedUserId;
  const { language } = useLanguage();

  // Translation hooks
  const noSavedArtworksText = useAutoTranslation("No saved artworks found.", language);

  const { data: savedArtworks = [], isLoading, isError, refetch } = useSavedArtworks(targetUserId);

  useEffect(() => {
    refetch();
  }, [refetch, visitedUserId]);

  const filteredSavedArtworks = useMemo(() => {
    return (savedArtworks || []).filter((art) => art && typeof art.id === "string" && art.id.trim() !== "");
  }, [savedArtworks]);

  const artworkIds = useMemo(() => filteredSavedArtworks.map((art) => art.id), [filteredSavedArtworks]);

  const { data: bulkStatus, isLoading: statusLoading } = useBulkArtworkStatus(artworkIds);
  const { data: reportStatus } = useBulkReportStatus(artworkIds);

  useEffect(() => {
    if (!visitedUserId || !setSavedArtworksCount) return;
    const count = filteredSavedArtworks.length;
    setSavedArtworksCount(count);
  }, [filteredSavedArtworks, visitedUserId, setSavedArtworksCount]);

  const bulkStatusLookup = React.useMemo(() => {
    if (!bulkStatus) return {};
    return bulkStatus.reduce((acc, item) => {
      acc[item.artwork_id] = item;
      return acc;
    }, {} as Record<string, (typeof bulkStatus)[number]>);
  }, [bulkStatus]);

  const reportStatusLookup = reportStatus || {};

  const handleButtonClick = useCallback(
    (artworkId: string) => {
      refetch();
    },
    [refetch]
  );

  if (!isLoading && filteredSavedArtworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
        <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
        <p className="text-sm text-gray-500">{noSavedArtworksText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
      {isLoading ? (
        <ArtCardSkeleton />
      ) : (
        filteredSavedArtworks.map((art) => {
          const isExplore = String(art.artistId) !== String(loggedInUserId);
          const isDeleted = art.visibility?.toLowerCase() === "deleted";
          const isArchived = art.visibility?.toLowerCase() === "archived";
          const status = bulkStatusLookup[art.id];
          const report = reportStatusLookup[art.id];

          const transformedArtwork = {
            ...art,
            artworkImage: art.artworkImage || art.image_url || "/pics/artwork-placeholder.png",
            artistImage: art.artistImage || art.profile_picture || "/pics/avatar-placeholder.png",
            artistName: art.artist || art.artistName,
            likesCount: art.likes_count,
            artistId: art.artist_id,
          };

          return (
            <ArtCard
              key={art.id}
              artwork={transformedArtwork}
              status={status}
              report={report}
              onButtonClick={() => handleButtonClick(art.id)}
              isExplore={isExplore}
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

export default CollectionTab;
