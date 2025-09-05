import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import ParticleBackground from "./ParticleBg"; 
import { cn } from "@/lib/utils"; // if you already have cn utility

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
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const intervalDuration = 2500;
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
  const currentArtwork = artworks[currentArtworkIndex];

  return (
    <div className="relative w-full h-full mx-auto rounded-lg overflow-hidden border bg-white">
      <ParticleBackground />

      {/* Full container artwork display */}
      <div
        key={currentArtwork.id}
        className={`absolute inset-0 transition-all duration-700 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{ animation: "fullScreenScale 0.7s ease-out forwards" }}
      >
        <img
          src={currentArtwork.image_url[0]}
          alt={currentArtwork.title}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* ✅ Progress indicator */}
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
                  ? "bg-white w-4" // active → expand pill
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
              className="text-xl font-bold mb-2 animate-fade-in"
              style={{ animationDelay: "0.3s", animationFillMode: "both" }}
            >
              {currentArtwork.title}
            </h2>
            <p
              className="text-xs text-gray-200 mb-4 animate-fade-in"
              style={{ animationDelay: "0.5s", animationFillMode: "both" }}
            >
              by {currentArtwork.artist.name}
            </p>

            <div
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: "0.7s", animationFillMode: "both" }}
            >
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1">
                <Heart size={14} className="text-red-600 fill-red-600" />
                <span className="text-[10px] font-semibold">
                  {currentArtwork.likes_count}
                </span>
              </div>

              <div className="text-[10px] text-gray-300 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                Featured Artwork {currentArtworkIndex + 1} of {artworks.length}
              </div>
            </div>
          </div>
        </div>
      </div>

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
