import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export const usePublishExhibit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exhibitId: string) => {
      const response = await apiClient.patch(`/exhibits/${exhibitId}/publish/`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Exhibit published successfully!");

      // Refetch queries for optimistic updates instead of invalidate
      queryClient.refetchQueries({ queryKey: ["pending-requests"] });
      queryClient.refetchQueries({ queryKey: ["exhibit-cards"] });
      queryClient.refetchQueries({ queryKey: ["my-exhibit-cards"] });
      queryClient.refetchQueries({ queryKey: ["exhibits"] });
      queryClient.refetchQueries({ queryKey: ["exhibit-review"] });
      queryClient.refetchQueries({ queryKey: ["collaborator-exhibit-view"] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || "Failed to publish exhibit.";
      toast.error(message);
    },
  });
};
