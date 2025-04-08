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
}

const ArtSlideshow = ({
  artworks,
  autoPlay = true,
  interval = 2000,
}: ArtSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval]);

  const nextSlide = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === artworks.length - 1 ? 0 : prevIndex + 1
    );

    setTimeout(() => setIsTransitioning(false), 500); 
  };

  const prevSlide = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? artworks.length - 1 : prevIndex - 1
    );

    setTimeout(() => setIsTransitioning(false), 500); 
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  if (artworks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No artworks to display</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {/* Slide container */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {artworks.map((artwork) => (
          <div
            key={artwork.id}
            className="w-full flex-shrink-0 h-full relative"
          >
            <img
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white z-10"
              style={{ height: "auto" }}
            >
              {/* <h3 className="text-xl font-bold mb-1">{artwork.title}</h3>
              <p className="text-sm opacity-90">by {artwork.artist}</p> */}
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-10 right-6 flex space-x-1 z-20">
        {artworks.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-1 h-1 rounded-full transition-all duration-300",
              index === currentIndex
                ? "bg-gray-300 w-4"
                : "bg-white/50 hover:bg-white/70"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ArtSlideshow;
