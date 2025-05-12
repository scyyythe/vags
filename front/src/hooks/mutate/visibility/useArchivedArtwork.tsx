import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const ArchivedArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/archived/`);
  return response.data;
};

const useArchivedArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ArchivedArtwork(id),
    onSuccess: (_, id) => {
      toast.success("You've successfully archived the artwork");

      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "created-by-me"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((artwork) => artwork.id !== id);
      });

      queryClient.invalidateQueries({ queryKey: ["my_artwork"] });
    },
    onError: () => {
      toast.error("Failed to archived artwork.");
    },
  });
};

export default useArchivedArtwork;
