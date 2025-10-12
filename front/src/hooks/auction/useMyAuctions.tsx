import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";
import { ArtworkAuction } from "./useAuction";

export const useMyAuctions = (
  { includeHidden } = {
    includeHidden: false,
  }
) => {
  return useQuery({
    queryKey: ["my-auctions", includeHidden],
    queryFn: async () => {
      const response = await apiClient.get(`/auction/list/created-by-me/`, {
        params: {
          include_hidden: includeHidden,
        },
      });

      const auctions: ArtworkAuction[] = response.data ?? [];

      const updatedAuctions = auctions.map((auction) => {
        const timeRemaining = calculateTimeRemaining(auction.end_time);
        return {
          ...auction,
          timeRemaining,
          highest_bid: auction.highest_bid ?? null,
        };
      });

      return updatedAuctions;
    },
    staleTime: 1000 * 60 * 5,
  });
};
