import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

interface UpdateVisibilityPayload {
  id: string;
  visibility: "Public" | "Private";
}

const updateArtworkVisibility = async ({
  id,
  visibility,
}: UpdateVisibilityPayload): Promise<{ message: string; visibility: string }> => {
  const response = await apiClient.patch(`/art/${id}/update-visibility/`, { visibility });
  return response.data;
};

const useUpdateArtworkVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateVisibilityPayload) => updateArtworkVisibility(payload),
    onSuccess: (data, payload) => {
      toast.success(data.message);

      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "all"], (oldData) => {
        if (!oldData) return [];
        return oldData.map((artwork) =>
          artwork.id === payload.id ? { ...artwork, visibility: data.visibility } : artwork
        );
      });

      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ queryKey: ["art", payload.id] });

      // Invalidate marketplace queries to ensure visibility changes appear immediately
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["trending-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["popular-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["popularArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["popular-artworks-light"] });
      queryClient.invalidateQueries({ queryKey: ["top-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["top-sellers"] });
      queryClient.invalidateQueries({ queryKey: ["explore"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-artworks"] });
    },
    onError: () => {
      toast.error("Failed to update artwork visibility.");
    },
  });
};

export default useUpdateArtworkVisibility;
