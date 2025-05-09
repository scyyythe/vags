import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const fetchArtworksByArtistId = async (artistId: string) => {
  const response = await apiClient.get(`art/list/artist/${artistId}/?fields=title,image,artist,likes_count`);

  if (response.status !== 200) {
    throw new Error("Failed to fetch artworks by artist");
  }
  return response.data;
};

const useArtworksByArtist = (artistId: string) => {
  return useQuery({
    queryKey: ["artworksByArtist", artistId],
    queryFn: () => fetchArtworksByArtistId(artistId),
    enabled: !!artistId,
  });
};

export default useArtworksByArtist;
