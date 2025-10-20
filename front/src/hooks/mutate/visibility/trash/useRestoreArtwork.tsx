import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const RestoreArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/restore/`);
  return response.data;
};

const useRestoreArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RestoreArtwork(id),
    onSuccess: (_, id) => {
      toast.success("You've successfully restored the artwork");

      // Update specific artwork in cache (remove from created-by-me trash)
      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "created-by-me"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((artwork) => artwork.id !== id);
      });

      // Invalidate all artwork and related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("popular-artworks") ||
              queryKey.includes("popular-artworks-light") ||
              queryKey.includes("marketplace-art-cards") ||
              queryKey.includes("trending-artworks") ||
              queryKey.includes("followedArtworks") ||
              queryKey.includes("my-sell-art-cards") ||
              queryKey.includes("top-artworks") ||
              queryKey.includes("top-sellers") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks") ||
              queryKey.includes("exhibits") ||
              queryKey.includes("reportStatus"))
          );
        },
      });
    },
    onError: () => {
      toast.error("Failed to restore artwork.");
    },
  });
};

export default useRestoreArtwork;
