import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export type ReviewResponse = {
  id: string;
  rating: number;
  comment: string;
  photos: string[];
  reviewDate: string;
  canEdit: boolean;
  canDelete: boolean;
  reviewerName?: string;
  artwork: {
    artworkImage: string;
    title: string;
    artist: string;
  };
};

export const useReviewByPurchase = () => {
  return useMutation({
    mutationFn: async (purchaseId: string): Promise<ReviewResponse> => {
      const { data } = await apiClient.post("/get-review-by-purchase/", {
        purchase_id: purchaseId,
      });
      return data;
    },
  });
};
