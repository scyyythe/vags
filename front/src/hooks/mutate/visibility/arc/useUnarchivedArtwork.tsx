import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const UnArchivedArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/unarchived/`);
  return response.data;
};

const useUnArchivedArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UnArchivedArtwork(id),
    onSuccess: (_, id) => {
      toast.success("You've successfully unarchived the artwork");

      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "created-by-me"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((artwork) => artwork.id !== id);
      });

      queryClient.invalidateQueries({ queryKey: ["artworks"] });
    },
    onError: () => {
      toast.error("Failed to unarchived artwork.");
    },
  });
};

export default useUnArchivedArtwork;
