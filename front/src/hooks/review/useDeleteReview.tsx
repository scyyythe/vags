import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      await apiClient.delete(`/review/${reviewId}/delete/`);
    },
    onSuccess: () => {
      toast.warning("Review deleted successfully!", { closeButton: true });
      queryClient.invalidateQueries({ queryKey: ["my-purchases"] });
    },
    onError: () => {
      toast.error("Failed to delete review.");
    },
  });
};
