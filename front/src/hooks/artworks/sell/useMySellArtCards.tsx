import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface ArtCard {
  id: string;
  title: string;
  price: number;
  discounted_price?: number | null;
  total_ratings: number;
  image_url: string[];
  category: string;
  art_status: string;
  visibility: string;
  artist_id: string;
}

const useMySellArtCards = () => {
  return useQuery<ArtCard[], Error>({
    queryKey: ["my-sell-art-cards"],
    queryFn: async () => {
      const { data } = await apiClient.get("/art/cards/my/");
      return data;
    },
  });
};

export default useMySellArtCards;
