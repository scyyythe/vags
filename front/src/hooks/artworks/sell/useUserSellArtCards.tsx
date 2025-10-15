import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { ArtCard } from "./useMySellArtCards";

export interface UseUserSellArtCardsOptions {
  status?: string;
  enabled?: boolean;
}

const useUserSellArtCards = (userId: string | undefined, options: UseUserSellArtCardsOptions = {}) => {
  const { status, enabled = true } = options;

  return useQuery<ArtCard[]>({
    queryKey: ["user-sell-art-cards", userId, status],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const params = new URLSearchParams();
      if (status) params.append("status", status);

      const { data } = await apiClient.get(`/art/cards/user/${userId}/?${params.toString()}`);
      return data;
    },
    enabled: !!userId && enabled,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep data fresh for 10 minutes
    gcTime: 10 * 60 * 1000,
  });
};

export default useUserSellArtCards;
