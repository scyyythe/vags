import { useState, useEffect } from "react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";

export interface ArtworkReview {
  id: string;
  score: number;
  comment: string;
  images: string[];
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
  };
}

// Hook for manual fetching (used in OnSaleTab)
export const useArtworkReviews = () => {
  const [artworkReviews, setArtworkReviews] = useState<ArtworkReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchArtworkReviews = async (artworkId: string) => {
    if (!artworkId) {
      toast.error("Artwork ID not found.");
      return { reviews: [], success: false };
    }

    setReviewsLoading(true);

    try {
      const response = await apiClient.get(`/review/all-by-artwork/${artworkId}/`);
      const reviews = response.data;

      if (reviews.length === 0) {
        toast.info("No reviews found for this artwork.");
        setArtworkReviews([]);
        setReviewsLoading(false);
        return { reviews: [], success: true };
      }

      setArtworkReviews(reviews);
      setReviewsLoading(false);
      return { reviews, success: true };
    } catch (error) {
      console.error("Error fetching artwork reviews:", error);
      toast.error("Failed to fetch reviews.");
      setReviewsLoading(false);
      return { reviews: [], success: false };
    }
  };

  return {
    artworkReviews,
    reviewsLoading,
    fetchArtworkReviews,
    setArtworkReviews,
  };
};

// Hook for automatic fetching (used in ViewProduct)
export const useArtworkReviewsAuto = (artworkId?: string) => {
  const [reviews, setReviews] = useState<ArtworkReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artworkId) {
      setReviews([]);
      setError(null);
      return;
    }

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(`/review/all-by-artwork/${artworkId}/`);
        const reviewsData = response.data || [];
        setReviews(reviewsData);
      } catch (err: any) {
        console.error("Error fetching artwork reviews:", err);
        setError(err.message || "Failed to fetch reviews");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [artworkId]);

  return { reviews, loading, error };
};
