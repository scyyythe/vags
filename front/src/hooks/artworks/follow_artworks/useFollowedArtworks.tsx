
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const useFollowedArtworks = (page: number) => {
  return useQuery({
    queryKey: ["followedArtworks", page],
    queryFn: async () => {
      const response = await apiClient.get(`/artworks/following?page=${page}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export default useFollowedArtworks;
