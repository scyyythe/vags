import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface PopularArtist {
  id: string;
  name: string;
  profile_picture: string;
  followers: number;
  artworks_count: number;
  reviews_count: number;
}

const fetchPopularArtists = async (): Promise<PopularArtist[]> => {
  const { data } = await apiClient.get("/popular-artists/");

  return data.map((artist: any) => ({
    id: artist.id || artist._id,
    name: artist.name,
    profile_picture: artist.profile_picture || artist.profilePicture,
    followers: artist.followers ?? 0,
    artworks_count: artist.artworks_count ?? 0,
    reviews_count: artist.reviews_count ?? 0,
  }));
};

const usePopularArtists = () => {
  return useQuery<PopularArtist[]>({
    queryKey: ["popular-artists"],
    queryFn: fetchPopularArtists,
    retry: 3, // Retry up to 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    refetchInterval: false, // Disable automatic polling
    refetchIntervalInBackground: false, // Don't poll when tab is not active
  });
};

export default usePopularArtists;
