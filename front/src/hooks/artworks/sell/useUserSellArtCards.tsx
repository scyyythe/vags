import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import { ArtCard } from "./useMySellArtCards";

const useUserSellArtCards = (userId: string | undefined) => {
  const [userArtCards, setUserArtCards] = useState<ArtCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserArtCards = async () => {
    if (!userId) return;
    try {
      const response = await apiClient.get(`/art/cards/user/${userId}/`);

      setUserArtCards(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load user's artworks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      fetchUserArtCards();
    }
  }, [userId]);

  return {
    myArtCards: userArtCards,
    isLoading,
    error,
    refetch: fetchUserArtCards,
  };
};

export default useUserSellArtCards;
