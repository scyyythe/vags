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
  });
};
