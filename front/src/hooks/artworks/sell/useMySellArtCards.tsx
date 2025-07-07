import { useEffect, useState } from "react";
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
}

const useMySellArtCards = () => {
  const [myArtCards, setMyArtCards] = useState<ArtCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyArtCards = async () => {
    try {
      const response = await apiClient.get("/art/cards/my/");
      setMyArtCards(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load your artworks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyArtCards();
  }, []);

  return { myArtCards, isLoading, error, refetch: fetchMyArtCards };
};

export default useMySellArtCards;
