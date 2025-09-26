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
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export default usePopularArtists;
