import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const unarchiveArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/unarchived/`);
  return response.data;
};

const useUnarchiveAllMyArtworks = (myArtworks: Artwork[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const archivedArtworks = myArtworks.filter((art) => art.visibility === "Archived");

      await Promise.all(archivedArtworks.map((art) => unarchiveArtwork(art.id)));

      return archivedArtworks.length;
    },
    onSuccess: (count) => {
      if (count === 0) {
        toast.info("No archived artworks to unarchive.");
        return;
      }
      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "created-by-me"], (oldData) => {
        if (!oldData) return [];
        return oldData.map((art) =>
          art.visibility === "Archived" ? { ...art, art_status: "Active", visibility: "Public" } : art
        );
      });

      queryClient.invalidateQueries({ queryKey: ["artworks"] });
    },
    onError: () => {
      toast.error("Failed to unarchive artworks.");
    },
  });
};

export default useUnarchiveAllMyArtworks;
