import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const restoreAuction = async (auctionId: string) => {
  if (!auctionId) throw new Error("Auction ID is required for restoration.");
  const response = await apiClient.patch(`/auction/${auctionId}/restore/`);
  return response.data;
};

export const useRestoreAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreAuction,
    onSuccess: () => {
      toast.success("Auction restored successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-auctions"] });
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["light-auctions"] });
    },
    onError: (error: any) => {
      console.error("Restore auction error", error);
      toast.error(error.response?.data?.detail || "Failed to restore auction.");
    },
  });
};
