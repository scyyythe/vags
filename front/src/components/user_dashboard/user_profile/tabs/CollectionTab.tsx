import React, { useMemo, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { getLoggedInUserId } from "@/auth/decode";
import useSavedArtworks from "@/hooks/artworks/fetch_artworks/useSavedArtworks";

type CollectionTabProps = {
  setSavedArtworksCount?: React.Dispatch<React.SetStateAction<number>>;
};

const ArtCardMemoized = React.memo(ArtCard);

const CollectionTab = ({ setSavedArtworksCount }: CollectionTabProps) => {
  const { savedArtworks, isLoading } = useSavedArtworks();
  const loggedInUserId = getLoggedInUserId();
  const { id: visitedUserId } = useParams();

  const filteredSavedArtworks = useMemo(() => {
    return (savedArtworks || []).filter((art) => !!art);
  }, [savedArtworks]);

  useEffect(() => {
    if (!visitedUserId || !setSavedArtworksCount) return;
    const count = filteredSavedArtworks.length;
    setSavedArtworksCount(count);
  }, [filteredSavedArtworks, visitedUserId, setSavedArtworksCount]);

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

          return (
            <ArtCardMemoized
              key={art.id}
              id={art.id}
              artistName={art.artist || "Unknown"}
              artistId={art.artist_id}
              artistImage={art.profile_picture || ""}
              artworkImage={art.image_url}
              title={art.title}
              onButtonClick={() => handleButtonClick(art.id)}
              isExplore={isExplore}
              likesCount={art.likes_count ?? 0}
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

export default CollectionTab;
