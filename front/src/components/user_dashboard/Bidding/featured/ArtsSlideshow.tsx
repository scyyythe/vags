import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import BidPopup from "../place_bid/BidPopup";
import { Link, useNavigate } from "react-router-dom";
import usePopularAuctions from "@/hooks/auction/featured/usePopularAuctions";
import CountdownDisplay from "./CountdownDisplay";
import { Artwork } from "@/hooks/artworks/owner/useMyArtworks";
import { User } from "@/hooks/users/useUserQuery";
import FeaturedAuctionSkeleton from "@/components/skeletons/bidding/FeaturedAuction";
import { formatCurrency } from "@/utils/numberFormat";
import { getArtworkImageUrl } from "@/utils/image/imageUtils";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
interface ArtSlideshowProps {
  artworks?: Artwork[];
  autoPlay?: boolean;
  interval?: number;
  user?: User;
}

const ArtSlideshow = memo(({ artworks, user, autoPlay = true, interval = 4000 }: ArtSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const [showBidPopup, setShowBidPopup] = useState(false);
  const [bidArtworkIndex, setBidArtworkIndex] = useState<number | null>(null);
  const { data, isLoading, isError } = usePopularAuctions();
  const navigate = useNavigate();
  const [translatedArtworks, setTranslatedArtworks] = useState<Record<string, { title: string; artist: string }>>({});

  // Translation hooks
  const failedToLoadText = useAutoTranslation("Failed to load auctions.", language);
  const noAuctionsText = useAutoTranslation("No auctions to display", language);
  const ownedByText = useAutoTranslation("Owned By", language);
  const currentBidText = useAutoTranslation("Current Bid", language);
  const bidNowText = useAutoTranslation("Bid Now", language);
  const viewItemText = useAutoTranslation("View item", language);
  const goToSlideText = useAutoTranslation("Go to slide", language);
  const unknownText = useAutoTranslation("Unknown", language);

  const handleBidSubmit = (amount: number) => {
    setShowBidPopup(false);
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const auctions = data ?? [];

  // Translate artwork titles and artist names
  useEffect(() => {
    const translateArtworks = async () => {
      const { autoTranslate } = await import("@/utils/autoTranslate");
      const translated: Record<string, { title: string; artist: string }> = {};

      for (const auction of auctions) {
        try {
          const translatedTitle =
            language.toLowerCase() !== "en"
              ? await autoTranslate(auction.artwork.title, language.toLowerCase())
              : auction.artwork.title;

          const translatedArtist =
            language.toLowerCase() !== "en"
              ? await autoTranslate(auction.artwork.artist, language.toLowerCase())
              : auction.artwork.artist;

          translated[auction.id] = {
            title: translatedTitle,
            artist: translatedArtist,
          };
        } catch (error) {
          translated[auction.id] = {
            title: auction.artwork.title,
            artist: auction.artwork.artist,
          };
        }
      }

      setTranslatedArtworks(translated);
    };

    if (auctions.length > 0) {
      translateArtworks();
    }
  }, [auctions, language]);

  useEffect(() => {
    if (!autoPlay) return;
    if (auctions.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === auctions.length - 1 ? 0 : prevIndex + 1));
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, auctions.length]);

  if (isLoading) return <FeaturedAuctionSkeleton />;
  if (isError) return <p className="text-gray-900 dark:text-gray-100">{failedToLoadText}</p>;
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-gray-900 dark:text-gray-100">{noAuctionsText}</p>
      </div>
    );
  }

  const selectedArtwork = bidArtworkIndex !== null ? auctions[bidArtworkIndex] : null;

  return (
    <div className={cn("", "items-center", isMobile ? "px-10 gap-1" : "px-8 py-8 gap-12")}>
      {auctions.map((artwork, index) => (
        <div
          key={artwork.id}
          className={cn(
            "absolute top-0 left-0 w-full h-full transition-opacity duration-[2500ms] ease-in-out",
            isMobile ? "flex flex-col items-center gap-6" : "flex flex-row items-center gap-20 pl-12",
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          )}
          aria-hidden={index !== currentIndex}
        >
          {/* Left - Artwork Image */}
          <div className={cn("overflow-hidden pt-1", isMobile ? "pt-4" : "pl-24")}>
            <img
              src={getArtworkImageUrl(artwork.artwork.image_url)}
              alt={artwork.artwork.title}
              className={cn("object-cover rounded-xl", isMobile ? "w-[350px] h-full" : "w-[350px] h-[350px]")}
              draggable={false}
            />
          </div>

          {/* Right - Artwork Info */}
          <div
            className={cn(
              "text-white flex flex-col justify-center",
              isMobile ? "w-[60%] pb-8 gap-1 -ml-28" : "w-[50%] gap-4"
            )}
          >
            <h2
              className={cn(
                "font-semibold",
                "bg-gradient-to-r from-red-300 via-red-500 to-red-900 bg-clip-text text-transparent",
                isMobile ? "text-xl mb-1" : "text-3xl"
              )}
            >
              {translatedArtworks[artwork.id]?.title || artwork.artwork.title}
            </h2>

            <div className="flex items-center gap-2 mb-3">
              <span className={cn("text-gray-600 dark:text-gray-400", isMobile ? "text-[11px]" : "text-xs")}>{ownedByText}</span>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Link to={`/userprofile/${artwork.artwork.artist_id}`} className="flex items-center gap-2">
                  {artwork.artwork.profile_picture ? (
                    <img
                      src={artwork.artwork.profile_picture}
                      alt={translatedArtworks[artwork.id]?.artist || artwork.artwork.artist}
                      className={cn("rounded-full object-cover", isMobile ? "w-3.5 h-3.5" : "w-4 h-4")}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={cn(
                      "rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold",
                      isMobile ? "w-3.5 h-3.5 text-[8px]" : "w-4 h-4 text-[10px]",
                      artwork.artwork.profile_picture ? "hidden" : "flex"
                    )}
                    style={{ display: artwork.artwork.profile_picture ? 'none' : 'flex' }}
                  >
                    {(translatedArtworks[artwork.id]?.artist || artwork.artwork.artist || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className={cn("text-black dark:text-white font-medium", isMobile ? "text-[11px]" : "text-xs")}>
                    {translatedArtworks[artwork.id]?.artist || artwork.artwork.artist}
                  </span>
                </Link>
              </div>
            </div>

            <div
              className={cn("bg-white dark:bg-gray-800 rounded-md flex ", isMobile ? "w-[350px] px-6 py-4" : "max-w-[475px] px-16 py-7")}
            >
              <div className="flex w-full">
                <div className="flex-1 text-center pl-1">
                  <p className="text-[11px] text-black dark:text-white mb-3 whitespace-nowrap">{currentBidText}</p>
                  <p className={cn("text-black dark:text-white font-semibold whitespace-nowrap", isMobile ? "text-lg" : "text-2xl")}>
                    {formatCurrency(artwork.highest_bid?.amount)}
                  </p>
                </div>

                <div className="border-l border-gray-300 dark:border-gray-600 h-19 mx-12"></div>

                <div className="flex flex-col text-center">
                  <CountdownDisplay startTime={artwork.start_time} endTime={artwork.end_time} isMobile={isMobile} />
                </div>
              </div>
            </div>

            <div className={cn("max-w-[480px] flex items-center mt-4", isMobile ? "gap-4 -mr-[110px]" : "gap-4")}>
              <button
                onClick={() => {
                  setBidArtworkIndex(index);
                  setShowBidPopup(true);
                }}
                className={cn(
                  "bg-red-800 text-white rounded-full font-medium ",
                  isMobile ? "w-60 px-3 py-2 text-[11px] " : "w-full px-8 py-2 text-sm"
                )}
              >
                {bidNowText}
              </button>
              <button
                onClick={() => navigate(`/bid/${artwork.id}/`)}
                className={cn(
                  "border border-gray-400 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full font-medium transition ",
                  isMobile ? "w-60 px-3 py-2 text-[11px]" : "w-full px-8 py-2 text-sm"
                )}
              >
                {viewItemText}
              </button>
            </div>
          </div>
        </div>
      ))}

      {showBidPopup && selectedArtwork && (
        <BidPopup
          isOpen={showBidPopup}
          onClose={() => setShowBidPopup(false)}
          data={selectedArtwork}
          artworkId={selectedArtwork.artwork.id}
          artworkTitle={selectedArtwork.artwork.title}
          username={user?.username || unknownText}
          fullName={`${user?.first_name || unknownText} ${user?.last_name || ""}`}
          start_bid_amount={selectedArtwork.start_bid_amount}
        />
      )}

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
              index === currentIndex 
                ? "bg-gray-300 dark:bg-red-400 w-3" 
                : "bg-black/50 dark:bg-white/30 hover:bg-white/70 dark:hover:bg-red-300/50"
            )}
            aria-label={`${goToSlideText} ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
});

export default ArtSlideshow;
