import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import BidPopup from "../place_bid/BidPopup";
import { Link } from "react-router-dom";
import usePopularAuctions from "@/hooks/auction/featured/usePopularAuctions";
import CountdownDisplay from "./CountdownDisplay";
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
const ArtSlideshow = ({ autoPlay = true, interval = 4000 }: Omit<ArtSlideshowProps, "artworks">) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();
  const [showBidPopup, setShowBidPopup] = useState(false);
  const [bidArtworkIndex, setBidArtworkIndex] = useState<number | null>(null);
  const { data, isLoading, isError } = usePopularAuctions();
  const auctions = data ?? [];

  useEffect(() => {
    if (!autoPlay) return;
    if (auctions.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === auctions.length - 1 ? 0 : prevIndex + 1));
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, auctions.length]);

  const selectedArtwork = bidArtworkIndex !== null ? auctions[bidArtworkIndex] : null;

  if (auctions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No auctions to display</p>
      </div>
    );
  }

  const handleBidSubmit = (amount: number) => {
    setShowBidPopup(false);
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };
  if (isLoading) return <p>Loading popular auctions...</p>;
  if (isError) return <p>Failed to load auctions.</p>;
  if (!auctions || auctions.length === 0) return <p>No auctions available.</p>;
  return (
    <div className={cn("", "flex items-center", isMobile ? "px-16 gap-1" : "px-8 py-8 gap-12")}>
      {auctions.map((artwork, index) => (
        <div
          key={artwork.id}
          className={cn(
            "absolute top-0 left-0 w-full h-full flex items-center gap-20 transition-opacity duration-[2500ms] ease-in-out",
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          )}
          aria-hidden={index !== currentIndex}
        >
          {/* Left - Artwork Image */}
          <div className={cn("aspect-square overflow-hidden py-16 pl-28 ml-6", isMobile ? "w-[45%] -mr-8" : "w-[38%]")}>
            <motion.img
              src={artwork.artwork.image_url}
              alt={artwork.artwork.title}
              className={cn("object-cover rounded-xl shadow-xl", isMobile ? "w-full h-full" : "w-full h-full")}
              draggable={false}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Right - Artwork Info */}
          <div
            className={cn("text-white flex flex-col justify-center", isMobile ? "w-[60%] py-8 gap-1" : "w-[50%] gap-4")}
          >
            <h2
              className={cn(
                "font-semibold",
                "bg-gradient-to-r from-red-300 via-red-500 to-red-900 bg-clip-text text-transparent",
                isMobile ? "text-lg mb-1" : "text-3xl"
              )}
            >
              {artwork.artwork.title}
            </h2>

            {/* <p
              className={cn(
                "text-black",
                isMobile ? "text-[9px]" : "text-sm mb-4"
              )}
            >
              {artwork.description}
            </p> */}

            <div className="flex items-center gap-2 mb-3">
              <span className={cn("text-gray-600", isMobile ? "text-[9px]" : "text-xs")}>Owned By</span>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Link to="/userprofile/" className="flex items-center gap-2">
                  <img
                    src={artwork.artwork.profile_picture}
                    alt={artwork.artwork.artist}
                    className={cn("rounded-full", isMobile ? "w-2 h-2" : "w-4 h-4")}
                  />

                  <span className={cn("text-black font-medium", isMobile ? "text-[9px]" : "text-xs")}>
                    {artwork.artwork.artist}
                  </span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-md px-16 py-7 flex max-w-[475px]">
              <div className="flex w-full">
                <div className="flex-1 text-center">
                  <p className="text-[11px] text-black mb-3">Current Bid</p>
                  <p className="text-2xl text-black md:text-xl font-semibold whitespace-nowrap">
                    {artwork.highest_bid?.amount ?? "No bids"}
                  </p>
                </div>

                <div className="border-l border-gray-300 h-19 mx-12"></div>

                <div className="flex flex-col text-center">
                  <CountdownDisplay startTime={artwork.start_time} endTime={artwork.end_time} isMobile={isMobile} />
                </div>
              </div>
            </div>

            <div className={cn("flex items-center mt-4", isMobile ? "gap-6" : "gap-8")}>
              <button
                onClick={() => {
                  setBidArtworkIndex(index);
                  setShowBidPopup(true);
                }}
                className={cn(
                  "bg-red-800 text-white rounded-full font-medium w-[38%]",
                  isMobile ? "px-3 py-1 text-[10px]" : "px-8 py-2 text-sm"
                )}
              >
                Bid Now
              </button>
              <button
                className={cn(
                  "border border-gray-400 text-gray-500 rounded-full font-medium transition w-[38%]",
                  isMobile ? "px-3 py-1 text-[10px] " : "px-8 py-2 text-sm"
                )}
              >
                View item
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* {showBidPopup && selectedArtwork && (
        // <BidPopup
        //   isOpen={showBidPopup}
        //   onClose={() => setShowBidPopup(false)}
        //   artworkTitle={selectedArtwork.artwork.title}
        //   artworkId={selectedArtwork.artwork.id}
        // />
      )} */}

      {/* Dots indicator */}
      <div
        className={cn("absolute flex z-30", isMobile ? "bottom-4 right-4 space-x-[2px]" : "bottom-6 right-6 space-x-1")}
      >
        {auctions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "rounded-full transition-all duration-300",
              isMobile ? "w-1 h-1" : "w-1 h-1",
              index === currentIndex ? "bg-gray-300 w-3" : "bg-black/50 hover:bg-white/70"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ArtSlideshow;
