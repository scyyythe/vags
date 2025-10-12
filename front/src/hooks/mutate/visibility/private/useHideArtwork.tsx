import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const hideArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/hide/`);
  return response.data;
};

const useHideArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hideArtwork(id),
    onSuccess: (_, id) => {
      toast.success("Artwork hidden successfully!");

      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["user-sell-art-cards"] });
    },
    onError: () => {
      toast.error("Failed to hide artwork.");
    },
  });
};

export default useHideArtwork;
