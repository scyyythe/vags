import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";
import { ArtworkAuction } from "./useAuction";
export const useFetchBiddingArtworkById = (id: string) => {
  return useQuery<ArtworkAuction, Error>({
    queryKey: ["biddingArtwork", id],
    queryFn: async () => {
      const response = await apiClient.get(`auction/${id}/`);

      const artwork = response.data;

      return {
        ...artwork,
        timeRemaining: calculateTimeRemaining(artwork.end_time),
        highest_bid: artwork.highest_bid ?? 0,
      };
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
