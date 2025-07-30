import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const useMarkAsShipped = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: string) => {
      const { data } = await apiClient.patch(`/my-sales/${purchaseId}/mark-shipped/`);
      return data;
    },
    onSuccess: () => {
      toast.success("Artwork marked as shipped!", { closeButton: true });
      queryClient.invalidateQueries({ queryKey: ["my-sold-artworks"] });
    },
    onError: () => {
      toast.error("Failed to mark as shipped.", { closeButton: true });
    },
  });
};

export default useMarkAsShipped;
