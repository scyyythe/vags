// frontend/hooks/exhibit/useToggleHideExhibit.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export const useToggleHideExhibit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exhibitId: string) => {
      const response = await apiClient.patch(`/exhibits/${exhibitId}/toggle-hide/`);
      return response.data;
    },
    onSuccess: (data, exhibitId) => {
      toast.success(data.detail);
      queryClient.invalidateQueries({ queryKey: ["exhibit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["exhibit", exhibitId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to toggle exhibit hidden state.");
    },
  });
};
