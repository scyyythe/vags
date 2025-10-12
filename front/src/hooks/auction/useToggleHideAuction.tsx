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
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
      queryClient.invalidateQueries({ queryKey: ["auction-cards"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to toggle auction hidden state.");
    },
  });
};
