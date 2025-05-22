import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useFetchBiddingArtworks } from "@/hooks/auction/useFetchBiddingArtworks";
import AuctionFeatureSkeleton from "@/components/skeletons/AuctionFeatureSkeleton";
const AuctionFeature = (initialTime) => {
  const { data: auctions } = useFetchBiddingArtworks();

  const featured = useMemo(() => {
    if (!auctions || auctions.length === 0) return null;
    return auctions.reduce((max, item) => {
      const maxBid = max.highest_bid ? max.highest_bid.amount : 0;
      const itemBid = item.highest_bid ? item.highest_bid.amount : 0;
      return itemBid > maxBid ? item : max;
    });
  }, [auctions]);

  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let newSecs = prev.secs - 1;
        let newMins = prev.mins;
        let newHrs = prev.hrs;

        if (newSecs < 0) {
          newSecs = 59;
          newMins -= 1;
        }

        if (newMins < 0) {
          newMins = 59;
          newHrs -= 1;
        }

        if (newHrs < 0) {
          clearInterval(timer);
          return { hrs: 0, mins: 0, secs: 0 };
        }

        return { hrs: newHrs, mins: newMins, secs: newSecs };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!featured || !featured.artwork) {
    return <AuctionFeatureSkeleton />;
  }

  return (
    <section className="py-20 px-6 md:px-12 bg-black text-white" id="auctions">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <motion.div
            className="relative overflow-hidden rounded-2xl"
            initial={{ opacity: 0, x: -50, y: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            animate={{
              y: [0, -10, 0],
              transition: {
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              },
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={featured.artwork.image_url}
              alt={featured.artwork.title}
              className="w-full max-h-[430px] object-contain"
            />
          </motion.div>

          <motion.div
            className="space-y-6 w-full max-w-lg"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                {featured.artwork.title.split(" ").length > 1 ? (
                  <>
                    {featured.artwork.title.split(" ").slice(0, -1).join(" ")}{" "}
                    <span className="text-[#E20B0B]">{featured.artwork.title.split(" ").slice(-1)}</span>
                  </>
                ) : (
                  featured.artwork.title
                )}
              </h2>
              <p className="text-gray-400 text-xs mb-10">{featured.artwork.description}</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-full overflow-hidden">
                <img src={featured.artwork.profile_picture} alt="Creator" className="w-full h-full object-cover" />
              </div>
              <div className="mb-2">
                <p className="text-[10px] text-gray-400">Owned by</p>
                <p className="text-xs font-medium">{featured.artwork.artist}</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-3xl py-7 flex justify-center items-center max-w-md">
              <div className="flex">
                <div className="flex-1 text-center">
                  <p className="text-[11px] text-white mb-3">Current Bid</p>
                  <p className="text-xl md:text-2xl font-semibold whitespace-nowrap">
                    {featured.highest_bid ? `₱ ${featured.highest_bid.amount.toLocaleString()}` : "No bids yet"}
                  </p>
                </div>

                <div className="border-l border-gray-700 h-19 mx-12"></div>

                <div className="flex-1 text-center">
                  <p className="text-[11px] text-white mb-3">Auction ending in</p>
                  <div className="flex text-center space-x-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-1">
                        {featured.timeRemaining.hrs.toString().padStart(2, "0")}
                      </p>
                      <p className="text-[10px] text-gray-400">hrs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-1">
                        {featured.timeRemaining.mins.toString().padStart(2, "0")}
                      </p>
                      <p className="text-[10px] text-gray-400">mins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-1">
                        {featured.timeRemaining.secs.toString().padStart(2, "0")}
                      </p>
                      <p className="text-[10px] text-gray-400">secs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-8">
              <button className="bg-red-700 text-white text-xs flex-1 rounded-full px-4 py-2 hover:bg-red-600">
                Place a bid
              </button>
              <button className="btn-secondary flex-1 text-xs rounded-full">View item</button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuctionFeature;
