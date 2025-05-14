import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  image: string;
}

interface ArtGalleryContainerProps {
  artworks: Artwork[];
}

const ArtGalleryContainer = ({ artworks }: ArtGalleryContainerProps) => {
  const navigate = useNavigate();
  const [spread, setSpread] = useState(false);

  const handleArtworkClick = (artworkId: string, artworkImage: string, artistName: string) => {
    navigate(`/artwork/${artworkId}`, { state: { artworkImage, artistName } });
  };

  useEffect(() => {
    const timeout = setTimeout(() => setSpread(true), 100); // trigger spread animation
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full mx-auto rounded-lg overflow-hidden py-12 border">
      <div className="text-center mb-10">
        <h2 className="text-sm font-bold">Popular this week</h2>
        <p className="text-[10px] text-gray-600 mt-2">Dive into this week’s handpicked collection of stunning creation.</p>
      </div>

      <div className="relative flex justify-center items-center h-[270px]">
        <div className="relative w-full max-w-7xl h-full">
          {artworks.map((art, index) => {
            const total = artworks.length;
            const cardGap = 200; // horizontal spacing between cards
            const centerOffset = (total - 1) / 2;

            const initialLeft = `calc(50% - ${(total / 2 - index) * 20}px)`;
            const spreadLeft = `calc(50% + ${(index - centerOffset) * cardGap}px)`;

            return (
              <div
                key={art.id}
                onClick={() => handleArtworkClick(art.id, art.image, art.artist)}
                className={
                  "absolute top-0 transition-all duration-1000 ease-in-out cursor-pointer" +
                  (spread ? " hover:rotate-[1.5deg] hover:-translate-y-1" : "")
                }
                style={{
                  left: spread ? spreadLeft : initialLeft,
                  transform: spread
                    ? `translate(-50%, 0) scale(1)`
                    : `translate(-50%, 0) scale(${1 - (0.05 * Math.abs(total / 2 - index))}) rotate(${index * 2 - total}px)`
                }}
              >
                <div
                  className="rounded-xl overflow-hidden shadow-lg transition-transform duration-500 ease-in-out hover:scale-105"
                  style={{
                    width: "180px",
                    height: "200px",
                    animation: spread ? `float 3s ease-in-out infinite` : undefined,
                  }}
                >
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-[70%] object-cover"
                  />
                  <div className="px-6 py-2 bg-white/80 backdrop-blur-lg text-xs whitespace-nowrap">
                    <div className="font-semibold">{art.title}</div>
                    <div className="flex justify-between">
                    <div className="text-[10px] text-gray-500">by {art.artist}</div>
                    <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <span>♥</span> 6k
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
