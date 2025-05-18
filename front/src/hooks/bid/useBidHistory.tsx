import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const fetchBidHistory = async (artworkId: string) => {
  const response = await apiClient.get(`bid/history/${artworkId}/`);
  return response.data;
};

export const useBidHistory = (artworkId: string) => {
  return useQuery({
    queryKey: ["bidHistory", artworkId],
    queryFn: () => fetchBidHistory(artworkId),
    enabled: !!artworkId,
  });
};
