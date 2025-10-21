import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const useFollowedArtworks = (page: number) => {
  return useQuery({
    queryKey: ["followedArtworks", page],
    queryFn: async () => {
      const response = await apiClient.get(`/artworks/following?page=${page}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: false, // Disable automatic polling
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 3, // Retry up to 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export default useFollowedArtworks;
