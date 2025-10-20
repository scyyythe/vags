import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const useMarkPurchaseCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: string) => {
      return await apiClient.patch(`/my-purchases/${purchaseId}/complete/`);
    },
    onSuccess: () => {
      toast.success("Purchase marked as completed!", {
        closeButton: true,
      });
      // Invalidate all purchase and related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("my-purchases") ||
              queryKey.includes("my-sold-artworks") ||
              queryKey.includes("user-sold-artworks") ||
              queryKey.includes("buyer-activity") ||
              queryKey.includes("purchase-orders") ||
              queryKey.includes("purchase-order") ||
              queryKey.includes("notifications") ||
              queryKey.includes("marketplace-art-cards") ||
              queryKey.includes("trending-artworks") ||
              queryKey.includes("followedArtworks") ||
              queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
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
      toast.error("Failed to mark as completed.", {
        closeButton: true,
      });
    },
  });
};

export default useMarkPurchaseCompleted;
