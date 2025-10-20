import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const ArchivedArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/archived/`);
  return response.data;
};

const useArchivedArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ArchivedArtwork(id),
    onSuccess: (_, id) => {
      toast.success("You've successfully archived the artwork");

      // Invalidate all artwork and marketplace queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("artworks") ||
              queryKey.includes("artwork") ||
              queryKey.includes("artwork-cards") ||
              queryKey.includes("marketplace-art-cards") ||
              queryKey.includes("my-sell-art-cards") ||
              queryKey.includes("user-sell-art-cards") ||
              queryKey.includes("trending-artworks") ||
              queryKey.includes("trendingArtworks") ||
              queryKey.includes("popular-artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("popular-artworks-light") ||
              queryKey.includes("followedArtworks") ||
              queryKey.includes("followed-artworks") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("myAuctionArtworks") ||
              queryKey.includes("hotBids") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("followedBiddings") ||
              queryKey.includes("my-auctions") ||
              queryKey.includes("myParticipatedAuctions") ||
              queryKey.includes("auctions") ||
              queryKey.includes("exhibits") ||
              queryKey.includes("exhibit-cards") ||
              queryKey.includes("exhibitCards") ||
              queryKey.includes("my-exhibit-cards") ||
              queryKey.includes("user-exhibits") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("dashboard") ||
              queryKey.includes("marketplace") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("top-artworks") ||
              queryKey.includes("top-sellers") ||
              queryKey.includes("notifications") ||
              queryKey.includes("my-purchases") ||
              queryKey.includes("buyer-activity") ||
              queryKey.includes("my-sold-artworks") ||
              queryKey.includes("user-sold-artworks") ||
              queryKey.includes("purchase-orders") ||
              queryKey.includes("purchase-order") ||
              queryKey.includes("reviews") ||
              queryKey.includes("artwork-reviews") ||
              queryKey.includes("all-reviews-by-purchase"))
          );
        },
      });
    },
    onError: () => {
      toast.error("Failed to archived artwork.");
    },
  });
};

export default useArchivedArtwork;
