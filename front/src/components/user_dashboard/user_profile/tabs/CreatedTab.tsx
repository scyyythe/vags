import { useState, useEffect, useMemo, useCallback } from "react";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import useMyArtworks, { Artwork } from "@/hooks/artworks/owner/useMyArtworks";

const CreatedTab = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const userId = useMemo(() => localStorage.getItem("user_id") || undefined, []);

  const { data: artworks, isLoading, error } = useMyArtworks(currentPage, userId, true);

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  const memoizedArtworks = useMemo(() => {
    return artworks || [];
  }, [artworks]);

  const handleButtonClick = useCallback(() => {}, []);

  if (isLoading) {
    return <p className="text-center text-sm text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-sm text-red-500">Error loading artworks.</p>;
  }

  if (memoizedArtworks.length === 0) {
    return <p className="text-center text-sm text-gray-500">You have not created anything yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
      {memoizedArtworks.map((art: Artwork) => (
        <ArtCard
          key={art.id}
          id={art.id}
          artistName={art.artistName}
          artistId={art.artist_id}
          artistImage={art.artistImage || ""}
          artworkImage={art.artworkImage}
          title={art.title}
          onButtonClick={handleButtonClick}
          isExplore={false}
          likesCount={art.likesCount ?? 0}
        />
      ))}
    </div>
  );
};

export default CreatedTab;
