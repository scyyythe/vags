import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";

interface CreateAuctionData {
  artwork_id: string;
  start_time: string;
  end_time: string;
  starting_bid: number;
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
        starting_bid: data.starting_bid,
      });

      await apiClient.patch(`/art/${data.artwork_id}/update/`, {
        art_status: "onBid",
      });

      return response.data;
    },

    onSuccess: () => {
      toast.success("Auction created successfully!");
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
    },

    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.error || "Failed to create auction.";
      console.error("Auction creation failed:", message);
      toast.error(message);
    },
  });
};
