import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  image: string;
}

interface ArtSlideshowProps {
  artworks: Artwork[];
  autoPlay?: boolean;
  interval?: number;
  onArtworkClick: (artworkId: string, artworkImage: string, artistName: string) => void;
}

const ArtSlideshow = ({ artworks, autoPlay = true, interval = 3000, onArtworkClick }: ArtSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === artworks.length - 1 ? 0 : prevIndex + 1));
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, artworks.length]);

  if (artworks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No artworks to display</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {/* Fade Animation Slides */}
      <div className="relative w-full h-full">
        {artworks.map((artwork, index) => (
          <div
            key={artwork.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
            style={{ pointerEvents: index === currentIndex ? "auto" : "none" }}
          >
            <div onClick={() => onArtworkClick(artwork.id, artwork.image, artwork.artist)} className="cursor-pointer">
              <img
                src={artwork.image}
                alt={artwork.title}
                className="w-full h-full object-cover"
                onError={() => console.error(`Failed to load image: ${artwork.image}`)}
              />

              <div className="absolute top-0 left-6 p-8 text-white z-20">
                <h3 className="text-xs font-bold mb-1">{artwork.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-10 right-6 flex space-x-1 z-30">
        {artworks.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-1 h-1 rounded-full transition-all duration-300",
              index === currentIndex ? "bg-gray-300 w-4" : "bg-white/50 hover:bg-white/70"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ArtSlideshow;
