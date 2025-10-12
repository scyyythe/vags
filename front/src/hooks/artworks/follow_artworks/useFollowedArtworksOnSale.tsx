import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const useFollowedArtworksOnSale = (page: number, enabled: boolean) => {
  return useQuery({
    queryKey: ["followedArtworks", page, enabled],
    queryFn: async () => {
      const response = await apiClient.get(`/artworks/onsale/following?page=${page}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    enabled,
    refetchOnMount: true,
    retry: 1,
  });
};

export default useFollowedArtworksOnSale;
