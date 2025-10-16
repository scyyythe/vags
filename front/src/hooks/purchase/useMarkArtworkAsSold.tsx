import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const useToggleArtworkStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artworkId: string) => {
      const { data } = await apiClient.patch(`/my-artworks/${artworkId}/mark-sold/`);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate all marketplace and artwork-related queries
      queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["my-sold-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["user-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["trending-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ queryKey: ["popular-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["popularArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["popular-artworks-light"] });
      queryClient.invalidateQueries({ queryKey: ["top-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["top-sellers"] });
      queryClient.invalidateQueries({ queryKey: ["explore"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-artworks"] });

      // Force immediate refetch of marketplace data
      queryClient.refetchQueries({ queryKey: ["marketplace-art-cards"] });
    },
    onError: () => {
      toast.error("Failed to update artwork status.", { closeButton: true });
    },
  });
};

export default useToggleArtworkStatus;
