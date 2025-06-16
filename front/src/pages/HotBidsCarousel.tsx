import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useFetchHotBids } from "@/hooks/auction/featured/useFetchHotBids";
import HotBidsCarouselSkeleton from "@/components/skeletons/HotBidsCarouselSkeleton";

const HotBidsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
const { data: hotBids, isLoading, isError } = useFetchHotBids();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const itemCount = hotBids?.length || 1;
        return (prev + 1) % itemCount;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [hotBids]);

  if (isLoading) {
    return <HotBidsCarouselSkeleton />;
  }

  if (isError || !hotBids) {
    return <div className="text-center py-10 text-red-500">Failed to load bids.</div>;
  }

  const filteredBids = hotBids
    .filter((auction) => auction.bid_history && auction.bid_history.length > 0)
    .sort((a, b) => b.bid_history.length - a.bid_history.length);

  const sortedHotBids = filteredBids.slice(0, Math.min(filteredBids.length, 5));

  const itemCount = sortedHotBids.length;

  const radius = 250;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? itemCount - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === itemCount - 1 ? 0 : prevIndex + 1));
  };

  return (
    <section className="py-20 px-6 md:px-12" id="bids">
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Explore Hot Bids</h2>

        <div className=" flex justify-center items-center h-[460px] -mb-20">
          {sortedHotBids.map((bid, index) => {
            const angle = ((index - currentIndex) * (360 / itemCount)) % 360;
            const radians = (angle * Math.PI) / 180;
            const x = Math.sin(radians) * radius * 1.9;
            const y = -Math.abs(Math.cos(radians) * radius * 0.4);
            const scale = 0.7 + Math.cos(radians) * 0.3;
            const opacity = 0.5 + Math.cos(radians) * 0.5;

            return (
              <motion.div
                key={bid.id}
                className="absolute transition-all duration-700"
                animate={{ transform: `translate(${x}px, ${y}px) scale(${scale})`, opacity }}
              >
                <div className="rounded-xl shadow-xl relative">
                  <img
                    src={bid.artwork.image_url}
                    alt={bid.artwork.title}
                    className="w-48 h-48 object-cover rounded-lg"
                  />

                  {/* Profile is only visible on center card */}
                  {index === currentIndex && (
                    <img
                      src={bid.artwork.profile_picture}
                      alt="profile"
                      className="w-10 h-10 rounded-full absolute -bottom-5 left-1/2 transform -translate-x-1/2 border-2 border-white"
                    />
                  )}
                </div>

                {index === currentIndex && (
                  <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">{bid.artwork.artist}</p>
                    <p className="text-lg font-medium">{bid.artwork.title}</p>
                  </div>
                )}
              </motion.div>
            );
          })}

          <div className="flex justify-center -mb-60 space-x-4">
            <button onClick={goToPrevious} className="p-2 rounded-full bg-black text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goToNext} className="p-2 rounded-full bg-black text-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotBidsCarousel;
