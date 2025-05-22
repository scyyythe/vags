import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";
import { ArtworkAuction } from "./useAuction";
export const useMyParticipatedAuctions = () => {
  return useQuery<ArtworkAuction[], Error>({
    queryKey: ["myParticipatedAuctions"],
    queryFn: async () => {
      const response = await apiClient.get("auction/my-bids/");

      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
