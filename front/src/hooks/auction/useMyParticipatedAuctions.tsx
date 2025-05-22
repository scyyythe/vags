import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { calculateTimeRemaining } from "@/utils/timeUtils";
import { ArtworkAuction } from "./useAuction";
export const useMyParticipatedAuctions = () => {
  return useQuery<ArtworkAuction[], Error>({
    queryKey: ["myParticipatedAuctions"],
    queryFn: async () => {
      console.log("Fetching my-bids from backend...");
      try {
        const response = await apiClient.get("auction/my-bids/");
        console.log("Response data:", response.data);
        return response.data;
      } catch (error: any) {
        console.error("Error fetching my-bids:", error.response?.data || error.message);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
