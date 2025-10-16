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
    },
  });
};
