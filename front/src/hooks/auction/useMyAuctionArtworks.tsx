import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";
import { ArtworkAuction } from "./useAuction";
export const useMyAuctionArtworks = (status?: "on_going" | "sold" | "closed" | "no_bidder") => {
  return useQuery<ArtworkAuction[], Error>({
    queryKey: ["myAuctionArtworks", status],
    queryFn: async () => {
      const response = await apiClient.get("auction/my/", {
        params: status ? { status } : {},
      });

      const artworks: ArtworkAuction[] = response.data ?? [];

      const updatedArtworks = artworks.map((artwork) => {
        const timeRemaining = calculateTimeRemaining(artwork.end_time);
        return {
          ...artwork,
          timeRemaining,
          highest_bid: artwork.highest_bid ?? null,
        };
      });

      console.log(`Fetched my auctions with status=${status ?? "all"}`, updatedArtworks);
      return updatedArtworks;
    },
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for my auctions
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};
