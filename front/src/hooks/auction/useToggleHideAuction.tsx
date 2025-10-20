import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export const useToggleHideAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (auctionId: string) => {
      const response = await apiClient.patch(`/auction/${auctionId}/toggle-hide/`);
      return response.data;
    },
    onSuccess: (data, auctionId) => {
      toast.success(data.detail);
      // Invalidate all auction-related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("my-auctions") ||
              queryKey.includes("myParticipatedAuctions") ||
              queryKey.includes("myAuctionArtworks") ||
              queryKey.includes("myAuctions") ||
              queryKey.includes("light-auctions") ||
              queryKey.includes("popular-auctions") ||
              queryKey.includes("hotBids") ||
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
      toast.error(error?.response?.data?.detail || "Failed to toggle auction hidden state.");
    },
  });
};
