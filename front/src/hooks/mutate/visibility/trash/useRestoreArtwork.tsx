import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const RestoreArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/restore/`);
  return response.data;
};

const useRestoreArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RestoreArtwork(id),
    onSuccess: (_, id) => {
      toast.success("You've successfully restored the artwork");

      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "created-by-me"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((artwork) => artwork.id !== id);
      });

      queryClient.invalidateQueries({ queryKey: ["artworks"] });
    },
    onError: () => {
      toast.error("Failed to restore artwork.");
    },
  });
};

export default useRestoreArtwork;
