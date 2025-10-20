import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const restoreAuction = async (auctionId: string) => {
  if (!auctionId) throw new Error("Auction ID is required for restoration.");
  const response = await apiClient.patch(`/auction/${auctionId}/restore/`);
  return response.data;
};

export const useRestoreAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreAuction,
    onSuccess: () => {
      toast.success("Auction restored successfully!");
      // Invalidate all auction-related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("auctions") ||
              queryKey.includes("my-auctions") ||
              queryKey.includes("light-auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks") ||
              queryKey.includes("myAuctions") ||
              queryKey.includes("popular-auctions") ||
              queryKey.includes("hotBids") ||
              queryKey.includes("myParticipatedAuctions") ||
              queryKey.includes("artworks") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks"))
          );
        },
      });
    },
    onError: (error: any) => {
      console.error("Restore auction error", error);
      toast.error(error.response?.data?.detail || "Failed to restore auction.");
    },
  });
};
