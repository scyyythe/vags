import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const DeleteArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/delete-art/`);
  return response.data;
};

const useDeleteArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DeleteArtwork(id),
    onSuccess: (_, id) => {
      toast.success("You've successfully deleted the artwork");

      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "created-by-me"], (oldData) => {
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

export default useDeleteArtwork;
