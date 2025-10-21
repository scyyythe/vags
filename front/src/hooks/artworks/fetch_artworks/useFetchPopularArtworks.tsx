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
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: false, // Disable automatic polling
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 3, // Retry up to 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export default useFetchPopularArtworks;
