
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const deleteExhibit = async (exhibitId: string) => {
  const response = await apiClient.delete(`/exhibits/${exhibitId}/delete/`);
  return response.data;
};

export const useDeleteExhibit = () => {
  return useMutation({
    mutationFn: deleteExhibit,
    onSuccess: () => {
      toast.success("Exhibit deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete error", error);
      toast.error("Failed to delete exhibit");
    },
  });
};
