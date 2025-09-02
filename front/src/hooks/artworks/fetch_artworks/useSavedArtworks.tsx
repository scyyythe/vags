import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { Artwork } from "./useArtworks";

const fetchSavedArtworks = async (userId?: string): Promise<Artwork[]> => {
  const endpoint = userId && userId !== "undefined" ? `saved/user/${userId}/` : "saved/";
  const response = await apiClient.get(endpoint);
  return response.data;
};

const useSavedArtworks = (userId?: string, enabled: boolean = true) => {
  return useQuery<Artwork[], Error>({
    queryKey: ["savedArtworks", userId ?? "current"],
    queryFn: () => fetchSavedArtworks(userId),
    enabled: !!enabled && (!!userId || userId === undefined),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export default useSavedArtworks;
