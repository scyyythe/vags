import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

type Review = {
  id: string;
  rating: number;
  comment: string;
  photos: string[];
  created_at: string;
  reviewerName: string;
};

export const useAllReviewsByPurchase = (purchaseId?: string) => {
  return useQuery<Review[]>({
    queryKey: ["all-reviews-by-purchase", purchaseId],
    queryFn: async () => {
      if (!purchaseId) throw new Error("No purchase ID provided.");
      const { data } = await apiClient.get(`/review/all-by-purchase/${purchaseId}/`);
      return data;
    },
    enabled: !!purchaseId,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnect
    refetchInterval: 3000, // Poll every 3 seconds for review updates
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 1, // Retry once on failure
  });
};
