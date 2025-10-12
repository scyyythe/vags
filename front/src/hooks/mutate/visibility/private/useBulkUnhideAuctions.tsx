import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const bulkUnhideAuctions = async (): Promise<{ message: string; count: number }> => {
  const response = await apiClient.patch("/auction/bulk-unhide/");
  return response.data;
};

const useBulkUnhideAuctions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUnhideAuctions,
    onSuccess: (data) => {
      // Invalidate all auction-related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["biddingArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["followedAuctions"] });
      queryClient.invalidateQueries({ queryKey: ["my-auctions"] });
      queryClient.invalidateQueries({ queryKey: ["myParticipatedAuctions"] });
      queryClient.invalidateQueries({ queryKey: ["myAuctionArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["hotBids"] });

      toast.success(`Successfully unhid ${data.count} auctions!`, {
        closeButton: true,
      });
    },
    onError: (error: any) => {
      console.error("Bulk unhide auctions error:", error);
      toast.error("Failed to unhide auctions.", {
        closeButton: true,
      });
    },
  });
};

export default useBulkUnhideAuctions;
