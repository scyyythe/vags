import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const useMarkPurchaseCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: string) => {
      return await apiClient.patch(`/my-purchases/${purchaseId}/complete/`);
    },
    onSuccess: () => {
      toast.success("Purchase marked as completed!", {
        closeButton: true,
      });
      queryClient.invalidateQueries({ queryKey: ["my-purchases"] });
    },
    onError: () => {
      toast.error("Failed to mark as completed.", {
        closeButton: true,
      });
    },
  });
};

export default useMarkPurchaseCompleted;
