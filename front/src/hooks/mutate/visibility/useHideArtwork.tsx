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

      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "all"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((artwork) => artwork.id !== id);
      });

      queryClient.invalidateQueries({ queryKey: ["my_artwork"] });
    },
    onError: () => {
      toast.error("Failed to hide artwork.");
    },
  });
};

export default useHideArtwork;
