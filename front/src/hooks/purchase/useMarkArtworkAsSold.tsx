import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const useToggleArtworkStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artworkId: string) => {
      const { data } = await apiClient.patch(`/my-artworks/${artworkId}/mark-sold/`);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate all marketplace and related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("my-sell-art-cards") ||
              queryKey.includes("marketplace-art-cards") ||
              queryKey.includes("my-sold-artworks") ||
              queryKey.includes("user-sell-art-cards") ||
              queryKey.includes("trending-artworks") ||
              queryKey.includes("followedArtworks") ||
              queryKey.includes("artworks") ||
              queryKey.includes("popular-artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("popular-artworks-light") ||
              queryKey.includes("top-artworks") ||
              queryKey.includes("top-sellers") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("notifications") ||
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
      toast.error("Failed to update artwork status.", { closeButton: true });
    },
  });
};

export default useToggleArtworkStatus;
