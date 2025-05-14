import { useNavigate } from "react-router-dom";
import ArtSlideshow from "./ArtSlideshow";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  image: string;
}

interface ArtGalleryContainerProps {
  artworks: Artwork[];
}

const ArtGalleryContainer = ({ artworks }: ArtGalleryContainerProps) => {
  const navigate = useNavigate();

  const handleArtworkClick = (artworkId: string, artworkImage: string, artistName: string) => {
    navigate(`/artwork/${artworkId}`, { state: { artworkImage, artistName } });
  };

  return (
    <div className="w-full mx-auto rounded-lg overflow-hidden">
      <div className="w-full aspect-[16/9] md:aspect-[15/6] rounded-xl overflow-hidden">
        <ArtSlideshow artworks={artworks} onArtworkClick={handleArtworkClick} />
      </div>
    </div>
  );
};

export default ArtGalleryContainer;
