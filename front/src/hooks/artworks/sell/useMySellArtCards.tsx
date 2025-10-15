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
  size?: string;
  medium?: string;
  edition?: string;
  year_created?: string;
  quantity?: number;
  average_rating?: number;
  profile_picture?: string;
  artist?: string;
}

export interface UseMySellArtCardsOptions {
  status?: string;
}

const useMySellArtCards = (options: UseMySellArtCardsOptions = {}) => {
  const { status } = options;

  return useQuery<ArtCard[]>({
    queryKey: ["my-sell-art-cards", status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);

      const { data } = await apiClient.get(`/art/cards/my/?${params.toString()}`);
      return data;
    },
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep data fresh for 10 minutes
    gcTime: 10 * 60 * 1000,
  });
};

export default useMySellArtCards;
