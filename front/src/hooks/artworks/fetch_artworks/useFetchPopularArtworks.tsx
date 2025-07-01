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
    queryKey: ["popular-artworks-light"],
    queryFn: fetchPopularArtworks,
    staleTime: 1000 * 60 * 10,
  });
};

export default useFetchPopularArtworks;
