import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useFetchPopularArtworks";

interface ArtGalleryContainerProps {
  artworks: Artwork[];
}

const ArtGalleryContainer = ({ artworks }: ArtGalleryContainerProps) => {
  const navigate = useNavigate();
  const [spread, setSpread] = useState(false);

  const handleArtworkClick = (artworkId: string, image_url: string, artistName: string) => {
    navigate(`/artwork/${artworkId}`, { state: { image_url, artistName } });
  };

  useEffect(() => {
    const timeout = setTimeout(() => setSpread(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  const stacked = [
    { left: -80, rotate: -11, z: 1 }, // leftmost
    { left: -40, rotate: -5, z: 2 },
    { left: 0, rotate: 0, z: 3 },     // center
    { left: 40, rotate: 5, z: 2 },
    { left: 80, rotate: 11, z: 1 },   // rightmost
  ];

  // Fan angles for 5 cards, adjust if you have a different number
  const fanAngles = [-12, -6, 0, 6, 12];

  const overlap = 70; //controls how much cards overlap in the stack
 
  const cardGap = 210;

  return (
    <div
      className="w-full mx-auto rounded-lg overflow-hidden py-12 border relative"
      style={{
        backgroundImage: `url('https://i.pinimg.com/736x/14/71/3a/14713acbcef8531935a634371213b58f.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        
      }}
    >
      <div className="text-center mb-10">
        <h2 className="text-md font-bold pb-2">Popular this week</h2>
        <div className="w-96 mx-auto">
          <p className="text-[10px] text-gray-600 mt-2">
            Dive into this week’s handpicked collection of stunning creations-each piece a bold exploration of imagination, emotion, and visual storytelling.
          </p>
        </div>
      </div>


      <div className="relative flex justify-center items-center h-[230px] pt-6">
        <div className="relative w-full max-w-7xl h-full">
          {artworks.map((art, index) => {
            const total = artworks.length;
            const cardWidth = 180;
            const centerOffset = (total - 1) / 2;

            // Initial stacked/fanned position
            const initialLeft = `calc(50% + ${(index - centerOffset) * overlap}px)`;
            const initialRotate = fanAngles[index] || 0;

            const floatConfigA = { duration: 3, delay: 0 };      // for cards 0, 2, 4
            const floatConfigB = { duration: 3.5, delay: 0.3 };  // for cards 1,3

            const { duration, delay } = (index === 1 || index === 3) ? floatConfigB : floatConfigA;

            const stack = stacked[index] || { left: 0, rotate: 0, z: 1 };

            // Spread position
            const spreadLeft = `calc(50% + ${(index - centerOffset) * cardGap}px)`;

            // Stepped effect for spread
            let topOffset = 0;
            if (spread && total === 5) {
              topOffset = (index === 1 || index === 3) ? 30 : 0;
            }

            return (
               <div
                key={art.id}
                onClick={() => handleArtworkClick(art.id, art.image_url, art.artistName)}
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
                    width: "158px",
                    height: "158px",
                    animation: spread
                      ? `float ${duration}s ease-in-out infinite`
                      : undefined,
                    animationDelay: spread ? `${delay}s` : undefined,
                  }}
                >
                {/* Full card image */}
                <img
                  src={art.image_url}
                  alt={art.title}
                  className="w-full h-full object-cover"
                />
                {/* Info container at the bottom */}
                <div className="absolute left-0 bottom-0 w-full px-4 pt-2 pb-1 bg-white/70 rounded-b-lg">
                  <div className="font-semibold text-[11px] leading-tight text-black -mb-1">{art.title}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-[8px] text-gray-700">by {art.artistName}</div>
                    <div className="flex items-center gap-1">
                      <span className="text-red-600 text-base">♥</span>
                      <span className="text-[11px] font-medium text-black">{art.likes_count}</span>
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
  );
};

export default ArtGalleryContainer;
