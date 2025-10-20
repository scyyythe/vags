import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface Artwork {
  id: string;
  title: string;
  artist: {
    name: string;
    profile_picture: string;
  };
  image_url: string[];
  likes_count: number;
}

const fetchPopularArtworks = async (): Promise<Artwork[]> => {
  const response = await apiClient.get("/art/popular/light/");
  return response.data.map((artwork: any) => ({
    id: artwork.id,
    title: artwork.title,
    artist: {
      name: artwork.artist?.name || "",
      profile_picture: artwork.artist?.profile_picture || "",
    },
    image_url: artwork.image_url,
    likes_count: artwork.likes_count,
  }));
};

const useFetchPopularArtworks = () => {
  return useQuery({
    queryKey: ["popularArtworks"],
    queryFn: fetchPopularArtworks,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for popular artworks
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};

export default useFetchPopularArtworks;
