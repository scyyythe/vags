import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { Artwork } from "./useArtworks";
export const useFetchArtworkById = (id: string) => {
  return useQuery<Artwork, Error>({
    queryKey: ["artworks", id],
    queryFn: async () => {
      const response = await apiClient.get(`art/${id}/`);
      return response.data;
    },
    enabled: Boolean(id && id.trim() !== ""),
    staleTime: 5 * 60 * 1000,
    
    refetchOnWindowFocus: false,
  });
};
