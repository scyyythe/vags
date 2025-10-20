import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export const useTrendingArtworks = () => {
  return useQuery({
    queryKey: ["trending-artworks"],
    queryFn: async () => {
      const { data } = await apiClient.get("/trending-artworks/");
      return data;
    },
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for trending artworks
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};
