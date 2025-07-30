import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface ArtCard {
  id: string;
  title: string;
  medium?: string;
  price: number;
  discounted_price?: number | null;
  total_ratings: number;
  image_url: string[];
  category: string;
  edition?: string;
  artist?: string;
  year_created?: string;
  size?: string;
  art_status?: string;
}

const fetchArtCards = async () => {
  const response = await apiClient.get("/art/cards/");
  return response.data as ArtCard[];
};

const useFetchArtCards = () => {
  return useQuery<ArtCard[], Error>({
    queryKey: ["marketplace-art-cards"],
    queryFn: fetchArtCards,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export default useFetchArtCards;
