import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const relistArtwork = async (artworkId: string) => {
  const response = await apiClient.patch(`art/${artworkId}/relist/`);
  return response.data;
};

export const useRelistArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: relistArtwork,
    onMutate: async (artworkId: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["marketplace-art-cards"] });
      await queryClient.cancelQueries({ queryKey: ["my-sell-art-cards"] });
      await queryClient.cancelQueries({ queryKey: ["user-sell-art-cards"] });

      // Snapshot the previous value
      const previousMarketplaceData = queryClient.getQueryData(["marketplace-art-cards"]);
      const previousMySellData = queryClient.getQueryData(["my-sell-art-cards"]);
      const previousUserSellData = queryClient.getQueryData(["user-sell-art-cards"]);

      // Optimistically update OnSaleTab data - remove from current view and add to available
      queryClient.setQueryData(["my-sell-art-cards"], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        // Remove from current view and update status to "onsale"
        return old.map((artwork: any) =>
          artwork.id === artworkId ? { ...artwork, art_status: "onSale", status: "onsale" } : artwork
        );
      });

      queryClient.setQueryData(["user-sell-art-cards"], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        // Remove from current view and update status to "onsale"
        return old.map((artwork: any) =>
          artwork.id === artworkId ? { ...artwork, art_status: "onSale", status: "onsale" } : artwork
        );
      });

      // Optimistically update marketplace data - add the relisted artwork
      queryClient.setQueryData(["marketplace-art-cards"], (old: any) => {
        if (!old) return old;
        if (Array.isArray(old)) {
          // Check if artwork already exists in marketplace
          const existingIndex = old.findIndex((artwork: any) => artwork.id === artworkId);
          if (existingIndex >= 0) {
            // Update existing artwork status
            const updated = [...old];
            updated[existingIndex] = { ...updated[existingIndex], art_status: "onSale", status: "onsale" };
            return updated;
          }
          // If not found, we'll let the refetch handle adding it
          return old;
        }
        if (old.results && Array.isArray(old.results)) {
          // Handle paginated response
          const existingIndex = old.results.findIndex((artwork: any) => artwork.id === artworkId);
          if (existingIndex >= 0) {
            const updated = { ...old };
            updated.results = [...old.results];
            updated.results[existingIndex] = {
              ...updated.results[existingIndex],
              art_status: "onSale",
              status: "onsale",
            };
            return updated;
          }
          return old;
        }
        return old;
      });

      // Return a context object with the snapshotted values
      return { previousMarketplaceData, previousMySellData, previousUserSellData };
    },
    onSuccess: (data, artworkId) => {
      toast.success(data.message || "Artwork relisted successfully!");
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ queryKey: ["myArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["marketplaceArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["wishlistArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["my-sold-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["user-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      // Also invalidate trending artworks and followed artworks
      queryClient.invalidateQueries({ queryKey: ["trending-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });
    },
    onError: (error: any, artworkId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMarketplaceData) {
        queryClient.setQueryData(["marketplace-art-cards"], context.previousMarketplaceData);
      }
      if (context?.previousMySellData) {
        queryClient.setQueryData(["my-sell-art-cards"], context.previousMySellData);
      }
      if (context?.previousUserSellData) {
        queryClient.setQueryData(["user-sell-art-cards"], context.previousUserSellData);
      }
      const message = error.response?.data?.detail || "Failed to relist artwork";
      toast.error(message);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["user-sell-art-cards"] });

      // Force immediate refetch of marketplace data
      queryClient.refetchQueries({ queryKey: ["marketplace-art-cards"] });
    },
  });
};
