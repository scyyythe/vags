import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const useFollowedAuctions = (page: number) => {
  return useQuery({
    queryKey: ["followedAuctions", page],
    queryFn: async () => {
      const response = await apiClient.get(`/auctions/following?page=${page}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default useFollowedAuctions;
