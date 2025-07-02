import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";

export interface ArtCard {
  id: string;
  title: string;
  price: number;
  discounted_price?: number | null;
  total_ratings: number;
  image_url: string[];
}

const useFetchArtCards = () => {
  const [artCards, setArtCards] = useState<ArtCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtCards = async () => {
    try {
      const response = await apiClient.get("/art/cards/");
      setArtCards(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load artworks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtCards();
  }, []);

  return { artCards, isLoading, error, refetch: fetchArtCards };
};

export default useFetchArtCards;
