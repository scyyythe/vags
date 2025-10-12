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
      // Invalidate all auction-related queries
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["biddingArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["followedAuctions"] });
      queryClient.invalidateQueries({ queryKey: ["my-auctions"] });
      queryClient.invalidateQueries({ queryKey: ["myParticipatedAuctions"] });
      queryClient.invalidateQueries({ queryKey: ["myAuctionArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["hotBids"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to toggle auction hidden state.");
    },
  });
};
