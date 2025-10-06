import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export const useAuctionActions = () => {
  const queryClient = useQueryClient();

  const closeAuction = useMutation({
    mutationFn: async (auctionId: string) => {
      const response = await apiClient.post(`/auction/close_new/${auctionId}/`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Auction closed successfully");
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["biddingArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["myAuctionArtworks"] });
    },
    onError: (err: any) => {
      console.error("Failed to close auction:", err);
      toast.error("Failed to close auction");
    },
  });

  const deleteAuction = useMutation({
    mutationFn: async (auctionId: string) => {
      const response = await apiClient.delete(`/auction/delete/${auctionId}/`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Auction deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["biddingArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["myAuctionArtworks"] });
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.error || error?.response?.data?.message || "Failed to delete auction";

      toast.error(errorMsg);
    },
  });

  return {
    closeAuction,
    deleteAuction,
  };
};
