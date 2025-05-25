import React, { useMemo, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { getLoggedInUserId } from "@/auth/decode";
import useSavedArtworks from "@/hooks/artworks/fetch_artworks/useSavedArtworks";
import useBulkArtworkStatus from "@/hooks/interactions/useArtworkStatus";
import useBulkReportStatus from "@/hooks/mutate/report/useReportStatus";
type CollectionTabProps = {
  setSavedArtworksCount?: React.Dispatch<React.SetStateAction<number>>;
};

const CollectionTab = ({ setSavedArtworksCount }: CollectionTabProps) => {
  const { savedArtworks, isLoading } = useSavedArtworks();
  const loggedInUserId = getLoggedInUserId();
  const { id: visitedUserId } = useParams();

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
    }, {});
  }, [bulkStatus]);

  const reportStatusLookup = reportStatus || {};

  const handleButtonClick = useCallback((artworkId: string) => {}, []);

  if (!isLoading && filteredSavedArtworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
        <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
        <p className="text-sm text-gray-500">No saved artworks found.</p>
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
            artworkImage: art.artworkImage || art.image_url || "",
            artistProfilePicture: art.artistImage || art.profile_picture || "",
            artistName: art.artist || art.artistName,
            likesCount: art.likes_count,
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
