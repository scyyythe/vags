import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      await apiClient.delete(`/review/${reviewId}/delete/`);
    },
    onSuccess: () => {
      toast.warning("Review deleted successfully!", { closeButton: true });
      // Invalidate all review and related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("my-purchases") ||
              queryKey.includes("all-reviews-by-purchase") ||
              queryKey.includes("artwork-reviews") ||
              queryKey.includes("reviews") ||
              queryKey.includes("notifications") ||
              queryKey.includes("marketplace-art-cards") ||
              queryKey.includes("trending-artworks") ||
              queryKey.includes("followedArtworks") ||
              queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("popular-artworks-light") ||
              queryKey.includes("top-artworks") ||
              queryKey.includes("top-sellers") ||
              queryKey.includes("my-sold-artworks") ||
              queryKey.includes("user-sold-artworks") ||
              queryKey.includes("buyer-activity") ||
              queryKey.includes("purchase-orders") ||
              queryKey.includes("purchase-order") ||
              queryKey.includes("exhibits") ||
              queryKey.includes("exhibit-cards") ||
              queryKey.includes("my-exhibit-cards") ||
              queryKey.includes("auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks"))
          );
        },
      });
    },
    onError: () => {
      toast.error("Failed to delete review.");
    },
  });
};
