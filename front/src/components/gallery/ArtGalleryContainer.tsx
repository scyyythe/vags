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
  return (
    <div className="w-full max-w-[97%] mx-auto rounded-3xl overflow-hidden">
      {/* Slideshow container with reduced height */}
      <div className="w-full aspect-[16/9] md:aspect-[15/6] rounded-xl overflow-hidden">
        <ArtSlideshow artworks={artworks} />
      </div>
    </div>
  );
};

export default ArtGalleryContainer;