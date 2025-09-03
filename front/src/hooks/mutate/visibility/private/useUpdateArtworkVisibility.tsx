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
    },
    onError: () => {
      toast.error("Failed to update artwork visibility.");
    },
  });
};

export default useUpdateArtworkVisibility;
