import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const unarchiveArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/unarchived/`);
  return response.data;
};

const useUnarchiveArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unarchiveArtwork(id),
    onSuccess: (_, id) => {
      toast.success("Artwork unarchived!");

      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "created-by-me"], (oldData) => {
        if (!oldData) return [];
        return oldData.map((art) => (art.id === id ? { ...art, art_status: "Active", visibility: "Public" } : art));
      });

      queryClient.invalidateQueries({ queryKey: ["artworks"] });
    },
    onError: () => {
      toast.error("Failed to unarchive artwork.");
    },
  });
};

export default useUnarchiveArtwork;
