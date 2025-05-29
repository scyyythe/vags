import ArtSlideshow from "./ArtsSlideshow";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistAvatar: string;
  description: string;
  image: string;
  endTime: string;
}

interface ArtGalleryContainerProps {
  artworks: Artwork[];
}

const ArtsContainer = ({ artworks }: ArtGalleryContainerProps) => {
  return (
    <div className="w-full mx-auto rounded-lg overflow-hidden py-12 relative">
      {/* Background image using <img> */}
      <img
        src="/public/pics/bg2.jpg"
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />

      {/* Slideshow container with reduced height */}
      <div className="w-full h-[340px] rounded-xl overflow-hidden">
        <ArtSlideshow />
      </div>
    </div>
  );
};

export default ArtsContainer;
