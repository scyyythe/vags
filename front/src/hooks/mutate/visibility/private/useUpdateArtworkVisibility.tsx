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
    onSuccess: async (data, payload) => {
      toast.success(data.message);

      // Update specific artwork in cache immediately for optimistic UI
      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "all"], (oldData) => {
        if (!oldData) return [];
        return oldData.map((artwork) =>
          artwork.id === payload.id ? { ...artwork, visibility: data.visibility } : artwork
        );
      });

      // Refetch all artwork-related queries for immediate real-time updates
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["artworks"] }),
        queryClient.refetchQueries({ queryKey: ["art", payload.id] }),
        queryClient.refetchQueries({ queryKey: ["marketplace-art-cards"] }),
        queryClient.refetchQueries({ queryKey: ["trending-artworks"] }),
        queryClient.refetchQueries({ queryKey: ["followedArtworks"] }),
        queryClient.refetchQueries({ queryKey: ["my-sell-art-cards"] }),
        queryClient.refetchQueries({ queryKey: ["popular-artworks"] }),
        queryClient.refetchQueries({ queryKey: ["popularArtworks"] }),
        queryClient.refetchQueries({ queryKey: ["popular-artworks-light"] }),
        queryClient.refetchQueries({ queryKey: ["top-artworks"] }),
        queryClient.refetchQueries({ queryKey: ["top-sellers"] }),
        queryClient.refetchQueries({ queryKey: ["explore"] }),
        queryClient.refetchQueries({ queryKey: ["feed"] }),
        queryClient.refetchQueries({ queryKey: ["profile"] }),
        queryClient.refetchQueries({ queryKey: ["user-artworks"] }),
      ]);
    },
    onError: () => {
      toast.error("Failed to update artwork visibility.");
    },
  });
};

export default useUpdateArtworkVisibility;
