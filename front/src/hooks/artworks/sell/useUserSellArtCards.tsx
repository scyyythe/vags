import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { ArtCard } from "./useMySellArtCards";

const useUserSellArtCards = (userId: string | undefined) => {
  return useQuery<ArtCard[], Error>({
    queryKey: ["user-sell-art-cards", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await apiClient.get(`/art/cards/user/${userId}/`);
      return data;
    },
    enabled: !!userId,
  });
};

export default useUserSellArtCards;
