import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { AxiosError } from "axios";

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
      toast.success(`Bid of ${variables.amount}K placed successfully!`);
    },
    onError: (error) => {
      const errMsg = error.response?.data?.error || "Failed to place bid.";
      toast.error(errMsg);
    },
  });
};
