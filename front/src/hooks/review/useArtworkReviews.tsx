import { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
interface ArtworkReview {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    profile_picture?: string;
    is_verified?: boolean;
  };
  score: number;
  comment: string;
  created_at: string;
  images?: string[];
}

export const useArtworkReviews = (artworkId: string) => {
  const [reviews, setReviews] = useState<ArtworkReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artworkId) return;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/review/all-by-artwork/${artworkId}/`);
        setReviews(response.data);
      } catch (err: any) {
        console.error("Error fetching artwork reviews:", err);
        setError(err.response?.data?.error || "Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [artworkId]);

  return { reviews, loading, error };
};
