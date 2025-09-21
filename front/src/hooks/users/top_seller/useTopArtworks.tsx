import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface TopArtwork {
  id: string;
  title: string;
  image_url: string | null;
  profile_picture: string | null;
  starting_price: number | null;
  buyers: number;
  edition: number;
  sold_count: number;
  artist_name: string;
  change24h: string;
  change7d: string;
}

const fetchTopArtworks = async (): Promise<TopArtwork[]> => {
  const { data } = await apiClient.get("/top-artworks/");
  return data;
};

const useTopArtworks = () => {
  return useQuery<TopArtwork[]>({
    queryKey: ["top-artworks"],
    queryFn: fetchTopArtworks,
  });
};

export default useTopArtworks;
