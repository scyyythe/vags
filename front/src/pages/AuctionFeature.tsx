import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useFetchBiddingArtworks } from "@/hooks/auction/useFetchBiddingArtworks";
import AuctionFeatureSkeleton from "@/components/skeletons/AuctionFeatureSkeleton";
import { useModal } from "../context/ModalContext";
import { formatCurrency } from "@/utils/numberFormat";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "../hooks/autoTranslate/useAutoTranslation";

const AuctionFeature = (initialTime) => {
  const { data: auctions } = useFetchBiddingArtworks();
  const { showRegisterModal, setShowRegisterModal } = useModal();
  const { language } = useLanguage();

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

  // ✅ Always call hooks at the top level
  const translatedTitle = useAutoTranslation(featured?.artwork?.title || "", language);
  const translatedDescription = useAutoTranslation(featured?.artwork?.description || "", language);

  // Translations for UI texts
  const tOwnedBy = useAutoTranslation("Owned by", language);
  const tCurrentBid = useAutoTranslation("Current Bid", language);
  const tAuctionEndingIn = useAutoTranslation("Auction ending in", language);
  const tNoBids = useAutoTranslation("No bids", language);
  const tHrs = useAutoTranslation("hrs", language);
  const tMins = useAutoTranslation("mins", language);
  const tSecs = useAutoTranslation("secs", language);
  const tPlaceBid = useAutoTranslation("Place a bid", language);
  const tViewItem = useAutoTranslation("View item", language);
  const tAmount = useAutoTranslation("amount", language);

  if (!featured || !featured.artwork) {
    return <AuctionFeatureSkeleton />;
  }

  const highestBidAmount = featured.highest_bid?.amount;

  return (
    <section
      className="w-full max-w-7xl mx-auto py-20 px-6 md:px-12 bg-black text-white"
      id="auctions"
    >
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <motion.div
            className="relative overflow-hidden rounded-xl"
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
              className="w-full max-w-lg max-h-[430px] object-contain"
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
                {translatedTitle.split(" ").length > 1 ? (
                  <>
                    {translatedTitle.split(" ").slice(0, -1).join(" ")}{" "}
                    <span className="text-[#E20B0B]">
                      {translatedTitle.split(" ").slice(-1)}
                    </span>
                  </>
                ) : (
                  translatedTitle
                )}
              </h2>
              <p className="text-gray-400 text-xs mb-10">
                {translatedDescription}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-full overflow-hidden">
                <img
                  src={featured.artwork.profile_picture}
                  alt="Creator"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mb-2">
                <p className="text-[10px] text-gray-400">{tOwnedBy}</p>
                <p className="text-xs font-medium">{featured.artwork.artist}</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-3xl py-7 flex justify-center items-center max-w-md">
              <div className="flex">
                <div className="flex-1 text-center">
                  <p className="text-[11px] text-white mb-3">{tCurrentBid}</p>
                  {highestBidAmount ? (
                    <p className="text-xl md:text-2xl font-semibold whitespace-nowrap">
                      {formatCurrency(highestBidAmount)} {tAmount}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">{tNoBids}</p>
                  )}
                </div>

                <div className="border-l border-gray-700 h-19 mx-12"></div>

                <div className="flex-1 text-center">
                  <p className="text-[11px] text-white mb-3">
                    {tAuctionEndingIn}
                  </p>
                  <div className="flex text-center space-x-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-1">
                        {featured.timeRemaining.hrs
                          .toString()
                          .padStart(2, "0")}
                      </p>
                      <p className="text-[10px] text-gray-400">{tHrs}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-1">
                        {featured.timeRemaining.mins
                          .toString()
                          .padStart(2, "0")}
                      </p>
                      <p className="text-[10px] text-gray-400">{tMins}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-1">
                        {featured.timeRemaining.secs
                          .toString()
                          .padStart(2, "0")}
                      </p>
                      <p className="text-[10px] text-gray-400">{tSecs}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-8">
              <button
                className="bg-red-700 text-white text-xs flex-1 rounded-full px-4 py-2 hover:bg-red-600"
                onClick={() => setShowRegisterModal(true)}
              >
                {tPlaceBid}
              </button>
              <button
                className="btn-secondary flex-1 text-xs rounded-full"
                onClick={() => setShowRegisterModal(true)}
              >
                {tViewItem}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuctionFeature;
