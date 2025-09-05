import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import ArtVideoIntro from "./ArtVideoIntro";
import ArtVideoOutro from "./ArtVideoOutro";
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

interface ArtVideoShowcaseProps {
  artworks: Artwork[];
  isLoading?: boolean;
}

type ShowcasePhase = "intro" | "main" | "outro";

const ArtVideoShowcase = ({ artworks, isLoading = false }: ArtVideoShowcaseProps) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<ShowcasePhase>("intro");
  const [spread, setSpread] = useState(false);
  const isMobile = window.innerWidth <= 768; // simple check for mobile

  const handleArtworkClick = (artworkId: string, image_url: string, artistName: string) => {
    navigate(`/artwork/${artworkId}`, { state: { image_url, artistName } });
  };

  // After intro → always go to outro
  useEffect(() => {
    if (phase === "intro") {
      const introTimer = setTimeout(() => {
        setPhase("outro");
      }, 5000);
      return () => clearTimeout(introTimer);
    }
  }, [phase]);

  const handleOutroComplete = () => {
    if (isMobile) {
      // mobile: loop intro ↔ outro
      setPhase("intro");
    } else {
      // desktop: go outro → main
      setPhase("main");
      setTimeout(() => setSpread(true), 100);

      // after main, go back to intro
      setTimeout(() => {
        setPhase("intro");
        setSpread(false);
      }, 8000);
    }
  };

  if (isLoading || artworks.length === 0) {
    return (
      <div className="relative w-full max-w-7xl mx-auto rounded-lg overflow-hidden border bg-white h-[400px] flex flex-col items-center justify-center">
        <ParticleBackground />
        <h2 className="text-md font-bold pb-2">Loading Popular Artworks...</h2>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto rounded-lg overflow-hidden border bg-white h-[400px]">
      <ParticleBackground />

      {/* Intro */}
      {phase === "intro" && <ArtVideoIntro artworks={artworks} />}

      {/* Outro */}
      {phase === "outro" && (
        <ArtVideoOutro artworks={artworks.slice(0, 5)} onComplete={handleOutroComplete} />
      )}

      {/* Main (desktop only) */}
      {!isMobile && phase === "main" && (
        <div className="relative text-center h-full flex flex-col">
          <h2 className="text-md font-bold pb-2 text-gray-900 mt-6">
            Popular this week
          </h2>
          <div className="w-96 mx-auto">
            <p className="text-[10px] text-gray-700 mt-2">
              Dive into this week's handpicked collection of stunning
              creations—each piece a bold exploration of imagination, emotion,
              and visual storytelling.
            </p>
          </div>

          <div className="relative flex justify-center items-center flex-1 pt-2">
            <div className="relative w-full max-w-7xl h-[230px]">
              {artworks.slice(0, 5).map((art, index) => {
                const total = 5;
                const centerOffset = (total - 1) / 2;
                const overlap = 80;
                const cardGap = 220;

                const initialLeft = `calc(50% + ${(index - centerOffset) * overlap}px)`;
                const fanAngles = [-12, -6, 0, 6, 12];
                const initialRotate = fanAngles[index] || 0;

                const floatConfigA = { duration: 3, delay: 0 };
                const floatConfigB = { duration: 3.5, delay: 0.3 };
                const { duration, delay } =
                  index === 1 || index === 3 ? floatConfigB : floatConfigA;

                const stacked = [
                  { left: -80, rotate: -11, z: 1 },
                  { left: -40, rotate: -5, z: 2 },
                  { left: 0, rotate: 0, z: 3 },
                  { left: 40, rotate: 5, z: 2 },
                  { left: 80, rotate: 11, z: 1 },
                ];
                const stack = stacked[index] || { left: 0, rotate: 0, z: 1 };

                const spreadLeft = `calc(50% + ${(index - centerOffset) * cardGap}px)`;

                let topOffset = 0;
                if (spread && total === 5) {
                  topOffset = index === 1 || index === 3 ? 30 : 0;
                }

                return (
                  <div
                    key={art.id}
                    onClick={() =>
                      handleArtworkClick(art.id, art.image_url?.[0], art.artist.name)
                    }
                    className={
                      "absolute transition-all duration-1000 ease-in-out cursor-pointer" +
                      (spread ? " hover:rotate-[1.5deg] hover:-translate-y-1" : "")
                    }
                    style={{
                      left: spread ? spreadLeft : initialLeft,
                      top: `${topOffset}px`,
                      transform: spread
                        ? "translate(-50%, 0) scale(1) rotate(0deg)"
                        : `translate(-50%, 0) scale(1) rotate(${initialRotate}deg)`,
                      zIndex: stack.z,
                    }}
                  >
                    <div
                      className="relative rounded-lg overflow-hidden shadow-lg transition-transform duration-500 ease-in-out hover:scale-105 bg-white"
                      style={{
                        width: "200px",
                        height: "200px",
                        animation: spread ? `float ${duration}s ease-in-out infinite` : undefined,
                        animationDelay: spread ? `${delay}s` : undefined,
                      }}
                    >
                      <img
                        src={art.image_url?.[0]}
                        alt={art.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute left-1/2 bottom-2 transform -translate-x-1/2 bg-white/80 rounded-md px-3 py-2 w-[90%] shadow-md backdrop-blur-sm">
                        <div className="font-semibold text-[11px] leading-tight text-left text-black -mb-0.5 truncate overflow-hidden whitespace-nowrap max-w-28">
                          {art.title}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-[8px] text-gray-700 truncate overflow-hidden whitespace-nowrap max-w-[60%]">
                            by {art.artist.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart size={10} className="text-red-700 fill-red-700" />
                            <span className="text-[10px] font-medium text-black">
                              {art.likes_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <style>{`
            @keyframes float {
              0% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
              100% { transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default ArtVideoShowcase;
