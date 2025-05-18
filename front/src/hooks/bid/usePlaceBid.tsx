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
      // Update cached highest bid for artwork list
      queryClient.setQueryData<any>(["biddingArtworks"], (oldData) => {
        if (!oldData) return [];

        return oldData.map((item) =>
          item.artwork.id === variables.artwork_id
            ? {
                ...item,
                highestBid: data.amount,
                bidderFullName: data.bidderFullName,
              }
            : item
        );
      });

      queryClient.invalidateQueries({ queryKey: ["biddingArtworks", variables.artwork_id] });

      queryClient.invalidateQueries({ queryKey: ["biddingArtworks"] });
    },
    onError: (error) => {
      const errMsg = error.response?.data?.error || "Failed to place bid.";
      toast.error(errMsg);
    },
  });
};
