import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLanguage } from "@/context/LanguageContext";
import ArtistSkeleton from "@/components/skeletons/ArtistSkeleton";
import usePopularArtists from "@/hooks/users/top_artist/usePopularArtists";
// Artist data
const artists = Array(12)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    name: "Angel Canete",
    followers: "30k",
    image: `https://i.pinimg.com/736x/b7/81/f8/b781f8392aeaaba8a341cc9aee443a23.jpg`,
  }));

const PopularArtists = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Get current language
  const { language } = useLanguage();

  // Translate heading + labels
  const popularArtistsHeading = useAutoTranslation("Popular Artists", language);
  const followersLabel = useAutoTranslation("Followers", language);

  const { data: topArtist, isLoading, isError, refetch } = usePopularArtists();
  const [isPaused, setIsPaused] = useState(false);

  // Create scrolling artists array like in TopSellersPreview
  const scrollingArtists = useMemo(() => {
    if (isLoading || isError || !topArtist || topArtist.length === 0) return [];
    return Array(4)
      .fill(topArtist || [])
      .flat();
  }, [topArtist, isLoading, isError]);

  return (
    <section className="" id="artists">
      <div className="w-full">
        <motion.div
          className="relative overflow-hidden pb-4 w-full"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Show skeletons while loading */}
          {isLoading && (
            <div className="flex gap-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <motion.div key={idx} variants={item} className="flex-shrink-0">
                  <ArtistSkeleton />
                </motion.div>
              ))}
            </div>
          )}

          {/* Show API data with auto-scrolling */}
          {!isLoading && !isError && scrollingArtists.length > 0 && (
            <div
              className="flex animate-scroll gap-4 whitespace-nowrap w-max"
              style={{
                animationPlayState: isPaused ? "paused" : "running",
                width: "200%",
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {scrollingArtists.map((artist, index) => (
                <div key={`${artist.id}-${index}`} className="flex-shrink-0">
                  <div className="artist-card bg-gray-50 group cursor-pointer px-4 py-3 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-md flex items-center justify-center">
                      {artist.profile_picture ? (
                        <img src={artist.profile_picture} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-700">
                          {artist.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium">{artist.name}</span>
                      <span className="text-[11px] text-red-500">
                        {Number(artist.followers ?? 0).toLocaleString()} {followersLabel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Show message if no data and not loading */}
          {!isLoading && !isError && scrollingArtists.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-gray-500">No popular artists found</p>
            </div>
          )}

          {/* Fallback if API fails with auto-scrolling */}
          {isError && (
            <div
              className="flex animate-scroll gap-4 whitespace-nowrap w-max"
              style={{
                animationPlayState: isPaused ? "paused" : "running",
                width: "200%",
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {Array(4)
                .fill(artists)
                .flat()
                .map((artist, index) => (
                  <div key={`${artist.id}-${index}`} className="flex-shrink-0">
                    <div className="artist-card group cursor-pointer bg-gray-100 p-4 rounded-full shadow-lg hover:shadow-2xl transition-shadow duration-300 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{artist.name}</span>
                        <span className="text-xs text-red-500">
                          {Number(artist.followers ?? 0).toLocaleString()} {followersLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
          animation-fill-mode: none;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        #artists {
          overflow-x: hidden;
        }
      `}</style>
    </section>
  );
};

export default PopularArtists;
