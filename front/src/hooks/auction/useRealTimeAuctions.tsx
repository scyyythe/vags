import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getLoggedInUserId } from "@/auth/decode";
import useUserActivity from "@/hooks/useUserActivity";

const useRealTimeAuctions = () => {
  const queryClient = useQueryClient();
  const userId = getLoggedInUserId();
  const { isActive } = useUserActivity();
  const [hasNewAuctions, setHasNewAuctions] = useState(false);

  // Effect that runs when auction data changes
  useEffect(() => {
    if (!userId || !isActive) return;

    // Get current auctions from cache
    const currentBiddingArtworks = queryClient.getQueryData<any[]>(["biddingArtworks"]) || [];
    const followedAuctions = queryClient.getQueryData<any[]>(["followedAuctions", 1]) || [];
    const myAuctions = queryClient.getQueryData<any[]>(["myAuctionArtworks"]) || [];

    // Show visual feedback if there are new auctions (you can customize this logic)
    if (currentBiddingArtworks.length > 0 || followedAuctions.length > 0 || myAuctions.length > 0) {
      setHasNewAuctions(true);
      // Reset after a short delay
      const timer = setTimeout(() => setHasNewAuctions(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setHasNewAuctions(false);
    }
  }, [queryClient, userId, isActive]);

  // Function to manually refresh auction queries
  const refreshAuctions = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return (
          Array.isArray(queryKey) &&
          (queryKey.includes("biddingArtworks") ||
            queryKey.includes("followedAuctions") ||
            queryKey.includes("myAuctionArtworks") ||
            queryKey.includes("auctions") ||
            queryKey.includes("my-auctions") ||
            queryKey.includes("light-auctions") ||
            queryKey.includes("popular-auctions") ||
            queryKey.includes("hotBids") ||
            queryKey.includes("myAuctionArtworks") ||
            queryKey.includes("myParticipatedAuctions") ||
            queryKey.includes("followedAuctions") ||
            queryKey.includes("auction"))
        );
      },
    });
  };

  return {
    hasNewAuctions,
    refreshAuctions,
  };
};

export default useRealTimeAuctions;
