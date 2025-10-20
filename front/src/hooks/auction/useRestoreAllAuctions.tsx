import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const restoreAllAuctions = async () => {
  const response = await apiClient.patch(`/auction/restore-all/`);
  return response.data;
};

export const useRestoreAllAuctions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreAllAuctions,
    onSuccess: (data) => {
      toast.success(data.message || "All deleted auctions restored!");
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
      console.error("Restore all auctions error", error);
      toast.error(error.response?.data?.detail || "Failed to restore all auctions.");
    },
  });
};
