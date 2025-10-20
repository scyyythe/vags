// useMarkArtworkAsUnlisted.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const useMarkArtworkAsUnlisted = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artworkId: string) => {
      const { data } = await apiClient.patch(`/my-artworks/${artworkId}/mark-unlisted/`);
      return data;
    },
    onMutate: async (artworkId: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["marketplace-art-cards"] });
      await queryClient.cancelQueries({ queryKey: ["trending-artworks"] });
      await queryClient.cancelQueries({ queryKey: ["followedArtworks"] });

      // Snapshot the previous value
      const previousMarketplaceData = queryClient.getQueryData(["marketplace-art-cards"]);
      const previousTrendingData = queryClient.getQueryData(["trending-artworks"]);
      const previousFollowedData = queryClient.getQueryData(["followedArtworks"]);

      // Optimistically update marketplace data - remove the artwork immediately
      queryClient.setQueryData(["marketplace-art-cards"], (old: any) => {
        if (!old) return old;
        if (Array.isArray(old)) {
          return old.filter((artwork: any) => artwork.id !== artworkId);
        }
        if (old.results && Array.isArray(old.results)) {
          return {
            ...old,
            results: old.results.filter((artwork: any) => artwork.id !== artworkId),
          };
        }
        return old;
      });

      // Optimistically update trending artworks
      queryClient.setQueryData(["trending-artworks"], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((artwork: any) => artwork.id !== artworkId);
      });

      // Optimistically update followed artworks
      queryClient.setQueryData(["followedArtworks"], (old: any) => {
        if (!old) return old;
        if (old.artworks && Array.isArray(old.artworks)) {
          return {
            ...old,
            artworks: old.artworks.filter((artwork: any) => artwork.id !== artworkId),
          };
        }
        return old;
      });

      // Optimistically update OnSaleTab data (my-sell-art-cards and user-sell-art-cards)
      queryClient.setQueryData(["my-sell-art-cards"], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((artwork: any) => artwork.id !== artworkId);
      });

      queryClient.setQueryData(["user-sell-art-cards"], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((artwork: any) => artwork.id !== artworkId);
      });

      // Return a context object with the snapshotted values
      return { previousMarketplaceData, previousTrendingData, previousFollowedData };
    },
    onSuccess: () => {
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

      // Call the success callback for tab switching
      onSuccessCallback?.();
    },
    onError: (err, artworkId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMarketplaceData) {
        queryClient.setQueryData(["marketplace-art-cards"], context.previousMarketplaceData);
      }
      if (context?.previousTrendingData) {
        queryClient.setQueryData(["trending-artworks"], context.previousTrendingData);
      }
      if (context?.previousFollowedData) {
        queryClient.setQueryData(["followedArtworks"], context.previousFollowedData);
      }
      toast.error("Failed to update artwork status.", { closeButton: true });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("marketplace-art-cards") ||
              queryKey.includes("trending-artworks") ||
              queryKey.includes("followedArtworks"))
          );
        },
      });
    },
  });
};

export default useMarkArtworkAsUnlisted;
