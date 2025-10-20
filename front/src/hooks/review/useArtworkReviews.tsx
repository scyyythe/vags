import { useState, useEffect } from "react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { useQuery } from "@tanstack/react-query";

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

// Hook for automatic fetching with real-time polling (used in ViewProduct)
export const useArtworkReviewsAuto = (artworkId?: string) => {
  const {
    data: reviews = [],
    isLoading: loading,
    error,
  } = useQuery<ArtworkReview[]>({
    queryKey: ["artwork-reviews", artworkId],
    queryFn: async () => {
      if (!artworkId) throw new Error("No artwork ID provided");
      const response = await apiClient.get(`/review/all-by-artwork/${artworkId}/`);
      return response.data || [];
    },
    enabled: !!artworkId,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for review updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });

  return {
    reviews,
    loading,
    error: error?.message || null,
  };
};

// Hook for real-time review fetching with polling (used in OnSaleTab and other components)
export const useArtworkReviewsRealTime = (artworkId?: string) => {
  const {
    data: reviews = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<ArtworkReview[]>({
    queryKey: ["artwork-reviews-realtime", artworkId],
    queryFn: async () => {
      if (!artworkId) throw new Error("No artwork ID provided");
      const response = await apiClient.get(`/review/all-by-artwork/${artworkId}/`);
      return response.data || [];
    },
    enabled: !!artworkId,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for review updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });

  return {
    reviews,
    loading,
    error: error?.message || null,
    refetch,
  };
};
