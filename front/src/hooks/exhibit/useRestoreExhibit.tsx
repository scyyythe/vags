import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { AxiosError } from "axios";

const restoreExhibit = async (exhibitId: string) => {
  if (!exhibitId) throw new Error("Exhibit ID is required for restoration.");

  const response = await apiClient.patch(`/exhibits/${exhibitId}/restore/`);
  return response.data;
};

export const useRestoreExhibit = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreExhibit,

    onSuccess: (_, exhibitId) => {
      toast.success("Exhibit restored successfully");

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["my-exhibit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["exhibit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["exhibit-card", exhibitId] });

      if (onSuccessCallback) onSuccessCallback();
    },

    onError: (error: unknown) => {
      console.error("Restore error", error);

      if (error instanceof AxiosError) {
        const message = error.response?.data?.detail || error.response?.data?.error || "Failed to restore exhibit.";
        toast.error(message);
      } else {
        toast.error("Failed to restore exhibit.");
      }
    },
  });
};
