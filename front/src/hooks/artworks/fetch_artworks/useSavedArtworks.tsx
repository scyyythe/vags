import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { Artwork } from "./useArtworks";

const fetchSavedArtworks = async (): Promise<Artwork[]> => {
  try {
    const response = await apiClient.get("saved/");
    return response.data;
  } catch (error) {
    console.error("Error fetching saved artworks: ", error);
    throw error;
  }
};

const useSavedArtworks = () => {
  const {
    data: savedArtworks,
    isLoading,
    isError,
    error,
  } = useQuery<Artwork[], Error>({
    queryKey: ["savedArtworks"],
    queryFn: fetchSavedArtworks,
  });

  return { savedArtworks, isLoading, isError, error };
};

export default useSavedArtworks;
