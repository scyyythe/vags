import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import ParticleBackground from "./ParticleBg";
import { cn } from "@/lib/utils"; 

interface Artwork {
  id: string;
  title: string;
  image_url: string[];
  artist: {
    name: string;
  };
  likes_count: number;
}

interface ArtVideoOutroProps {
  artworks: Artwork[];
  onComplete?: () => void;
}

const ArtVideoOutro = ({ artworks, onComplete }: ArtVideoOutroProps) => {
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const intervalDuration = 3000;
    const interval = setInterval(() => {
      setCurrentArtworkIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= artworks.length) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete?.();
          }, 1000);
          return prevIndex;
        }
        return nextIndex;
      });
    }, intervalDuration);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, [artworks.length, onComplete]);

  if (!artworks[currentArtworkIndex]) return null;

  return (
    <div className="relative w-full h-full mx-auto rounded-lg overflow-hidden border bg-white">
      <ParticleBackground />

      {/* Fade transition wrapper */}
      <div className="absolute inset-0">
        {artworks.map((artwork, index) => (
          <div
            key={artwork.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentArtworkIndex ? "opacity-100" : "opacity-0"
            )}
          >
            <img
              src={artwork.image_url[0]}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div
        className={cn(
          "absolute flex z-30",
          isMobile ? "bottom-4 right-4 space-x-[2px]" : "bottom-6 right-6 space-x-1"
        )}
      >
        {artworks.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentArtworkIndex(index)}
            className={cn(
              "rounded-full transition-all duration-300",
              isMobile ? "w-1 h-1" : "w-1 h-1",
              index === currentArtworkIndex
                ? "bg-white w-4"
                : "bg-white/40 hover:bg-white/70"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Artwork info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="max-w-2xl">
          <h2
            key={`title-${currentArtworkIndex}`}
            className="text-xl font-bold mb-2 animate-fade-in"
            style={{ animationDelay: "0.6s", animationFillMode: "both" }}
          >
            {artworks[currentArtworkIndex].title}
          </h2>

          <p
            key={`artist-${currentArtworkIndex}`}
            className="text-xs text-gray-200 mb-4 animate-fade-in"
            style={{ animationDelay: "0.9s", animationFillMode: "both" }}
          >
            by {artworks[currentArtworkIndex].artist.name}
          </p>

          <div
            key={`info-${currentArtworkIndex}`}
            className="flex items-center gap-3 animate-fade-in"
            style={{ animationDelay: "1.2s", animationFillMode: "both" }}
          >
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
              <Heart size={14} className="text-red-600 fill-red-600" />
              <span className="text-[10px] font-semibold">
                {artworks[currentArtworkIndex].likes_count}
              </span>
            </div>

            <div className="text-[10px] text-gray-300 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
              Featured Artwork {currentArtworkIndex + 1} of {artworks.length}
            </div>
          </div>
        </div>
      </div>

      {/* Fade-in for artwork info (unchanged) */}
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ArtVideoOutro;
