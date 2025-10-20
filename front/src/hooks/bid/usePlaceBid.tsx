import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import apiClient from "@/utils/apiClient";

type Identity = "anonymous" | "username" | "fullName";

interface PlaceBidPayload {
  artwork_id: string;
  amount: number;
  identity_type: Identity;
}

interface BidResponse {
  id: string;
  amount: number;
  timestamp: string;
  bidderFullName: string;
}

interface ErrorResponse {
  error: string;
}

export const usePlaceBid = () => {
  const queryClient = useQueryClient();

  return useMutation<BidResponse, AxiosError<ErrorResponse>, PlaceBidPayload>({
    mutationFn: async ({ artwork_id, amount, identity_type }) => {
      const response = await apiClient.post<BidResponse>("bid/", {
        artwork_id,
        amount,
        identity_type,
      });

      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific auction data in cache
      queryClient.setQueryData<any>(["biddingArtworks"], (oldData) => {
        if (!oldData) return [];

        return oldData.map((item) =>
          item.artwork.id === variables.artwork_id
            ? {
                ...item,
                highest_bid: { amount: data.amount, bidderFullName: data.bidderFullName },
                highestBid: data.amount,
                bidderFullName: data.bidderFullName,
              }
            : item
        );
      });

      // Invalidate all bid-related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("biddingArtworks") ||
              queryKey.includes("popular-auctions") ||
              queryKey.includes("auctions") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks") ||
              queryKey.includes("bid") ||
              queryKey.includes("artworks") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed"))
          );
        },
      });

      // Show success toast
      toast.success(`Bid of ₱${data.amount} placed successfully!`, {
        duration: 3000,
        description: "Your bid has been recorded",
      });
    },
    onError: (error) => {
      const errMsg = error.response?.data?.error || "Failed to place bid.";
      toast.error(errMsg);
    },
  });
};
