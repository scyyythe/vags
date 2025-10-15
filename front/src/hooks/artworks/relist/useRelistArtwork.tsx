import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const relistArtwork = async (artworkId: string) => {
  const response = await apiClient.patch(`art/${artworkId}/relist/`);
  return response.data;
};

export const useRelistArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: relistArtwork,
    onSuccess: (data) => {
      toast.success(data.message || "Artwork relisted successfully!");
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ queryKey: ["myArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["marketplaceArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["wishlistArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["my-sold-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["user-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Failed to relist artwork";
      toast.error(message);
    },
  });
};
