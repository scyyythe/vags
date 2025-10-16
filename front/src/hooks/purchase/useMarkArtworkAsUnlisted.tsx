// useMarkArtworkAsUnlisted.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const useMarkArtworkAsUnlisted = () => {
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

      // Return a context object with the snapshotted values
      return { previousMarketplaceData, previousTrendingData, previousFollowedData };
    },
    onSuccess: () => {
      // Invalidate all marketplace and artwork-related queries
      queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["my-sold-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["user-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["trending-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ queryKey: ["popular-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["popularArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["popular-artworks-light"] });
      queryClient.invalidateQueries({ queryKey: ["top-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["top-sellers"] });
      queryClient.invalidateQueries({ queryKey: ["explore"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-artworks"] });
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
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["trending-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });
    },
  });
};

export default useMarkArtworkAsUnlisted;
