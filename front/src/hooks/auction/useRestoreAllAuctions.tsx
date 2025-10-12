import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const restoreAllAuctions = async () => {
  const response = await apiClient.patch(`/auction/restore-all/`);
  return response.data;
};

export const useRestoreAllAuctions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreAllAuctions,
    onSuccess: (data) => {
      toast.success(data.message || "All deleted auctions restored!");
      queryClient.invalidateQueries({ queryKey: ["my-auctions"] });
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["light-auctions"] });
    },
    onError: (error: any) => {
      console.error("Restore all auctions error", error);
      toast.error(error.response?.data?.detail || "Failed to restore all auctions.");
    },
  });
};
