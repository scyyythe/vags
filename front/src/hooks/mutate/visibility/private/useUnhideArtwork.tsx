import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const unhideArtworkById = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/unhide/`);
  return response.data;
};

const useUnhideAllMyArtworks = (myArtworks: Artwork[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const hiddenArts = myArtworks.filter((art) => art.visibility?.toLowerCase() === "hidden");

      await Promise.all(hiddenArts.map((art) => unhideArtworkById(art.id)));

      return hiddenArts.length;
    },
    onSuccess: (count) => {
      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "created-by-me"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((artwork) => artwork.visibility?.toLowerCase() !== "hidden");
      });

      queryClient.invalidateQueries({ queryKey: ["artworks"] });
    },
    onError: () => {
      toast.error("Failed to unhide artworks.");
    },
  });
};

export default useUnhideAllMyArtworks;
