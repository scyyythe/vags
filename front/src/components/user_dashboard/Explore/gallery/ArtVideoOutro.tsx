import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import ParticleBackground from "./ParticleBg"; 

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

  useEffect(() => {
    setIsVisible(true);
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

    return () => clearInterval(interval);
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
        style={{
          animation: "fullScreenScale 0.7s ease-out forwards",
        }}
      >
        {/* Artwork image fills container */}
        <img
          src={currentArtwork.image_url[0]}
          alt={currentArtwork.title}
          className="w-full h-full object-cover"
        />

        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* Progress indicator overlay → bottom-right */}
        <div className="absolute bottom-4 right-4 z-30 flex space-x-2">
          {artworks.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentArtworkIndex
                  ? "bg-white w-8"
                  : index < currentArtworkIndex
                  ? "bg-white/60 w-4"
                  : "bg-white/20 w-4"
              }`}
            />
          ))}
        </div>

        {/* Artwork info at the bottom-left */}
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
                <Heart size={16} className="text-red-700 fill-red-700" />
                <span className="text-xs font-semibold">
                  {currentArtwork.likes_count}
                </span>
              </div>

              <div className="text-xs text-gray-300 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                Featured Artwork {currentArtworkIndex + 1} of {artworks.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ArtVideoOutro;
