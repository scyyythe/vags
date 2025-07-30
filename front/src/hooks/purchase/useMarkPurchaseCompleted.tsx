
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

const useMarkPurchaseCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: string) => {
      return await apiClient.patch(`/my-purchases/${purchaseId}/complete/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-purchases"] }); 
    },
  });
};

export default useMarkPurchaseCompleted;
