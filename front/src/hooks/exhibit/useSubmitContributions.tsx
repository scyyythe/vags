import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export function useSubmitContributions(exhibitId: string) {
  return useMutation({
    mutationFn: async (payload: { artwork: string; slot_number: number }[]) => {
      console.log("Submitting contributions payload:", payload); 
      const response = await apiClient.post(`/exhibits/${exhibitId}/contribute/`, {
        artworks: payload, // 👈 wrap payload in 'artworks' key
      });
      return response.data;
    },
  });
}
