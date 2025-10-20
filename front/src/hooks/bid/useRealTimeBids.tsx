import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getLoggedInUserId } from "@/auth/decode";
import useUserActivity from "@/hooks/useUserActivity";

const useRealTimeBids = (artworkId?: string) => {
  const queryClient = useQueryClient();
  const userId = getLoggedInUserId();
  const { isActive } = useUserActivity();
  const [hasNewBids, setHasNewBids] = useState(false);

  // Effect that runs when bid data changes
  useEffect(() => {
    if (!userId || !isActive) return;

    // Get current bid data from cache
    const currentBidHistory = artworkId ? queryClient.getQueryData<any[]>(["biddingArtworks", artworkId]) || [] : [];

    const currentBiddingArtworks = queryClient.getQueryData<any[]>(["biddingArtworks"]) || [];

    // Show visual feedback if there are new bids (you can customize this logic)
    if (currentBidHistory.length > 0 || currentBiddingArtworks.length > 0) {
      setHasNewBids(true);
      // Reset after a short delay
      const timer = setTimeout(() => setHasNewBids(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setHasNewBids(false);
    }
  }, [queryClient, userId, isActive, artworkId]);

  // Function to manually refresh bid queries
  const refreshBids = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return (
          Array.isArray(queryKey) &&
          (queryKey.includes("biddingArtworks") ||
            queryKey.includes("bid") ||
            queryKey.includes("auctions") ||
            queryKey.includes("followedAuctions") ||
            queryKey.includes("myAuctionArtworks") ||
            queryKey.includes("popular-auctions") ||
            queryKey.includes("artworks") ||
            queryKey.includes("explore") ||
            queryKey.includes("feed"))
        );
      },
    });
  };

  return {
    hasNewBids,
    refreshBids,
  };
};

export default useRealTimeBids;
