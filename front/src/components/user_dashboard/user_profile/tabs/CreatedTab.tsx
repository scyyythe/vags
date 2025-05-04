import { useArtworkContext } from "@/context/ArtworkContext";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";

const CreatedTab = () => {
  const { artworks } = useArtworkContext();

  if (!artworks || artworks.length === 0) {
    return <p className="text-center text-sm text-gray-500">No artworks found.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
      {artworks.map((art) => (
        <ArtCard
          key={art.id}
          id={art.id}
          artistName={art.artistName}
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
