import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const fetchBidHistory = async (artworkId: string) => {
  const response = await apiClient.get(`bid/history/${artworkId}/`);
  return response.data;
};

export const useBidHistory = (artworkId: string) => {
  return useQuery({
    queryKey: ["biddingArtworks", artworkId],
    queryFn: () => fetchBidHistory(artworkId),
    enabled: !!artworkId,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for bid updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};
