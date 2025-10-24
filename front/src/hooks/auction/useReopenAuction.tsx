import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

interface ReopenAuctionParams {
  auctionId: string;
  start_time?: string;
  end_time?: string;
  start_bid_amount?: number;
}

const reopenAuction = async (params: ReopenAuctionParams) => {
  const { auctionId, start_time, end_time, start_bid_amount } = params;
  const response = await apiClient.patch(`auction/${auctionId}/reopen/`, {
    start_time,
    end_time,
    start_bid_amount,
  });
  return response.data;
};

export const useReopenAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reopenAuction,
    onSuccess: (data) => {
      toast.success(data.message || "Auction reopened successfully!");
      // Invalidate all auction-related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("auctions") ||
              queryKey.includes("myAuctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks") ||
              queryKey.includes("my-auctions") ||
              queryKey.includes("light-auctions") ||
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
      const message = error.response?.data?.detail || "Failed to reopen auction";
      toast.error(message);
    },
  });
};
