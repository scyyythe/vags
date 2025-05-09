import { useState, useMemo } from "react";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import useArtworks from "@/hooks/artworks/useArtworks";
const CreatedTab = () => {
  const [currentPage] = useState(1);

  const { data: artworks } = useArtworks(currentPage);
  if (!artworks || artworks.length === 0) {
    return <p className="text-center text-sm text-gray-500">You have not created anything yet.</p>;
  }
   
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
      {artworks.map((art) => (
        <ArtCard
          key={art.id}
          id={art.id}
          artistName={art.artistName}
          artistId={art.artist_id}
          artistImage={art.artistImage || ""}
          artworkImage={art.artworkImage}
          title={art.title}
          onButtonClick={() => {}}
          isExplore={false}
          likesCount={art.likesCount ?? 0}
        />
      ))}
    </div>
  );
};

export default CreatedTab;
