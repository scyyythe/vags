import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const reopenAuction = async (auctionId: string) => {
  const response = await apiClient.patch(`auction/${auctionId}/reopen/`);
  return response.data;
};

export const useReopenAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reopenAuction,
    onSuccess: (data) => {
      toast.success(data.message || "Auction reopened successfully!");
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["myAuctions"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Failed to reopen auction";
      toast.error(message);
    },
  });
};
