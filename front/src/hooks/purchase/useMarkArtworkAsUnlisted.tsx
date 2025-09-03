import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const useMarkArtworkAsUnlisted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artworkId: string) => {
      const { data } = await apiClient.patch(`/my-artworks/${artworkId}/mark-unlisted/`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["my-sold-artworks"] });
    },
    onError: () => {
      toast.error("Failed to update artwork status.", { closeButton: true });
    },
  });
};

export default useMarkArtworkAsUnlisted;
