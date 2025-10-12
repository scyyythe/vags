import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { AxiosError } from "axios";

const restoreAllExhibits = async () => {
  const response = await apiClient.patch(`/exhibits/restore-all/`);
  return response.data;
};

export const useRestoreAllExhibits = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreAllExhibits,

    onSuccess: (data) => {
      toast.success(data.message || "All deleted exhibits have been restored successfully");

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["my-exhibit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["exhibit-cards"] });

      if (onSuccessCallback) onSuccessCallback();
    },

    onError: (error: unknown) => {
      console.error("Restore all error", error);

      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.detail || error.response?.data?.error || "Failed to restore all exhibits.";
        toast.error(message);
      } else {
        toast.error("Failed to restore all exhibits.");
      }
    },
  });
};
