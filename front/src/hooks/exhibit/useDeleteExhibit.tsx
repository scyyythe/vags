import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { AxiosError } from "axios";

const deleteExhibit = async (exhibitId: string) => {
  if (!exhibitId) throw new Error("Exhibit ID is required for deletion.");

  const response = await apiClient.delete(`/exhibits/${exhibitId}/delete/`);
  return response.data;
};

export const useDeleteExhibit = (onSuccessCallback?: () => void) => {
  return useMutation({
    mutationFn: deleteExhibit,

    onSuccess: (_, exhibitId) => {
      toast.success("Exhibit deleted successfully");

     
      if (onSuccessCallback) onSuccessCallback();
    },

    onError: (error: unknown) => {
      console.error("Delete error", error);

      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to delete exhibit.";
        toast.error(message);
      } else {
        toast.error("Failed to delete exhibit.");
      }
    },
  });
};
