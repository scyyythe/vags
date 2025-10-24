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
    <div className="w-full mx-auto rounded-lg overflow-hidden py-12 relative bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background image using <img> */}
      <img
        src="/pics/bg2.jpg"
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover z-0 dark:hidden"
      />

      {/* Dark mode gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-0 hidden dark:block"></div>
      
      {/* Red accent overlay for dark mode */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-900/10 via-transparent to-red-800/5 z-0 hidden dark:block"></div>
      
      {/* Red glow effects for dark mode */}
      <div className="absolute top-4 left-4 w-32 h-32 bg-red-500/20 rounded-full blur-3xl z-0 hidden dark:block"></div>
      <div className="absolute bottom-4 right-4 w-24 h-24 bg-red-600/15 rounded-full blur-2xl z-0 hidden dark:block"></div>
      <div className="absolute top-1/2 right-8 w-16 h-16 bg-red-400/10 rounded-full blur-xl z-0 hidden dark:block"></div>

      {/* Slideshow container with reduced height */}
      <div className="w-full h-[340px] rounded-xl overflow-hidden">
        <ArtSlideshow />
      </div>
    </div>
  );
};

export default ArtsContainer;
