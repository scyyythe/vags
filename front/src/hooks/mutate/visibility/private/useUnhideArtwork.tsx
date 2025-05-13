import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const UnhideArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/unhide/`);
  return response.data;
};

const useUnhideArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UnhideArtwork(id),
    onSuccess: (_, id) => {
      toast.success("Artwork unhidden successfully!");

      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "all"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((artwork) => artwork.id !== id);
      });

      queryClient.invalidateQueries({ queryKey: ["artworks"] });
    },
    onError: () => {
      toast.error("Failed to unhide artwork.");
    },
  });
};

export default useUnhideArtwork;
