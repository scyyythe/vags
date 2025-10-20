import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const useFollowedAuctions = (page: number) => {
  return useQuery({
    queryKey: ["followedAuctions", page],
    queryFn: async () => {
      const response = await apiClient.get(`/auctions/following?page=${page}`);
      return response.data;
    },
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for followed auctions
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};

export default useFollowedAuctions;
