import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export const usePublishExhibit = () => {
  return useMutation({
    mutationFn: async (exhibitId: string) => {
      const response = await apiClient.patch(`/exhibits/${exhibitId}/publish/`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Exhibit published successfully!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail || "Failed to publish exhibit.";
      toast.error(message);
    },
  });
};
