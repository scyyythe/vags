import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";

interface CreateAuctionData {
  artwork_id: string;
  start_time: string;
  end_time: string;
  start_bid_amount: number;
}

interface ErrorResponse {
  error: string;
}

export const useCreateAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAuctionData) => {
      console.log("Creating auction with data:", data);

      const response = await apiClient.post("auction/create/", {
        artwork_id: data.artwork_id,
        start_time: data.start_time,
        end_time: data.end_time,
        start_bid_amount: data.start_bid_amount,
      });

      await apiClient.patch(`/art/${data.artwork_id}/update/`, {
        art_status: "onBid",
      });

      return response.data;
    },

    onSuccess: () => {
      toast.success("Auction created successfully!");
      queryClient.refetchQueries({ queryKey: ["auctions"] });
      queryClient.refetchQueries({ queryKey: ["artworks"] });
      queryClient.refetchQueries({ queryKey: ["biddingArtworks"] });
    },
    onError: (error: any) => {
      console.error("Error caught in mutation:", error);
      let message = "Failed to create auction.";

      if (error.response?.data) {
        console.log("Error response data:", error.response.data);
        if (typeof error.response.data === "string") {
          message = error.response.data;
        } else if (error.response.data.error) {
          message = error.response.data.error;
        } else if (error.response.data.detail) {
          message = error.response.data.detail;
        }
      } else if (error.message) {
        message = error.message;
      }
    },
  });
};
