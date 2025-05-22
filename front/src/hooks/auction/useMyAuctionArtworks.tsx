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
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
