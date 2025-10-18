import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export function useSubmitContributions(exhibitId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { artwork: string; slot_number: number }[]) => {
      
      const response = await apiClient.post(`/exhibits/${exhibitId}/contribute/`, {
        artworks: payload, 
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notifications since the backend creates notifications for the exhibit owner
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
