import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export function useSubmitContributions(exhibitId: string) {
  return useMutation({
    mutationFn: async (payload: { artwork: string; slot_number: number }[]) => {
      
      const response = await apiClient.post(`/exhibits/${exhibitId}/contribute/`, {
        artworks: payload, 
      });
      return response.data;
    },
  });
}
