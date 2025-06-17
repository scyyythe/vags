import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";
import { ArtworkAuction } from "./useAuction";

export const useFetchBiddingArtworkById = (id: string) => {
  return useQuery<ArtworkAuction, Error>({
    queryKey: ["biddingArtworks", id],
    queryFn: async () => {
      const response = await apiClient.get(`auction/${id}/`);
      const artwork = response.data;

      return {
        ...artwork,
        timeRemaining: calculateTimeRemaining(artwork.end_time),
        highest_bid: artwork.highest_bid ?? null,
      };
    },
    enabled: !!id,
    staleTime: 0,
    
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
  });
};
