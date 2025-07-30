
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export const useTrendingArtworks = () => {
  return useQuery({
    queryKey: ["trending-artworks"],
    queryFn: async () => {
      const { data } = await apiClient.get("/trending-artworks/");
      return data;
    },
  });
};
