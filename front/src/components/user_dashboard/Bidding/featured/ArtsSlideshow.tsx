import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistAvatar: string;
  description: string;
  image: string;
  endTime: string; // example: "2d : 15h : 20m"
}

interface ArtSlideshowProps {
  artworks: Artwork[];
  autoPlay?: boolean;
  interval?: number;
}

const ArtSlideshow = ({
  artworks,
  autoPlay = true,
  interval = 4000,
}: ArtSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === artworks.length - 1 ? 0 : prevIndex + 1
      );
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
    <div
      className={cn(
        "relative w-full h-full overflow-hidden rounded-2xl bg-black",
        "px-8 py-8 flex items-center gap-12",
        isMobile && "px-2 py-2"
      )}
    >
      {artworks.map((artwork, index) => (
        <div
          key={artwork.id}
          className={cn(
            "absolute top-0 left-0 w-full h-full flex items-center gap-12 transition-opacity duration-[2500ms] ease-in-out",
            index === currentIndex
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          )}
          aria-hidden={index !== currentIndex}
        >
          {/* Left - Artwork Image */}
          <div
            className={cn(
              "aspect-square overflow-hidden",
              isMobile ? "w-[30%] min-w-[80px]" : "w-[40%]"
            )}
          >
            <img
              src={artwork.image}
              alt={artwork.title}
              className={cn(
                "object-cover rounded-sm",
                isMobile ? "w-full h-full" : "w-full h-full"
              )}
              draggable={false}
            />
          </div>

          {/* Right - Artwork Info */}
          <div
            className={cn(
              "text-white flex flex-col justify-center gap-4",
              isMobile ? "w-[60%] py-8" : "w-[50%]"
            )}
          >
            <h2
              className={cn(
                "font-semibold mb-2",
                "bg-gradient-to-r from-white via-pink-400 to-red-600 bg-clip-text text-transparent",
                isMobile ? "text-lg" : "text-5xl"
              )}
            >
              {artwork.title}
            </h2>

            <p
              className={cn(
                "text-gray-200 mb-4",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              {artwork.description}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  "text-gray-400",
                  isMobile ? "text-[10px]" : "text-xs"
                )}
              >
                Owned By
              </span>
              <div className="flex items-center gap-2">
                <img
                  src={artwork.artistAvatar}
                  alt={artwork.artist}
                  className={cn(
                    "rounded-full",
                    isMobile ? "w-3 h-3" : "w-5 h-5"
                  )}
                />
                <span
                  className={cn(
                    "font-medium",
                    isMobile ? "text-[10px]" : "text-xs"
                  )}
                >
                  {artwork.artist}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-16 mt-4">
              <button
                className={cn(
                  "border border-white rounded-full font-semibold transition w-[50%]",
                  isMobile
                    ? "px-3 py-1 text-xs hover:border-red-600 hover:text-red-600"
                    : "px-8 py-3 hover:border-red-600 hover:text-red-600"
                )}
              >
                Bid Now
              </button>

              <div className="flex flex-col text-center">
                <span
                  className={cn(
                    "mb-2",
                    isMobile ? "text-xxs" : "text-xs"
                  )}
                >
                  Ending In
                </span>
                <span
                  className={cn(
                    "text-red-500 font-medium",
                    isMobile ? "text-[10px]" : "text-[16px]"
                  )}
                >
                  {artwork.endTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Dots indicator */}
      <div
        className={cn(
          "absolute flex space-x-1 z-30",
          isMobile ? "bottom-2 right-2" : "bottom-6 right-6"
        )}
      >
        {artworks.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "rounded-full transition-all duration-300",
              isMobile ? "w-2 h-2" : "w-1 h-1",
              index === currentIndex
                ? "bg-gray-300 w-3"
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
