import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const updateArtwork = async ({ id, formData }: { id: string; formData: FormData }): Promise<Artwork> => {
  const response = await apiClient.patch(`/art/${id}/update`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const useUpdateArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: string; formData: FormData }) => updateArtwork(payload),

    onSuccess: (updatedArtwork) => {
      toast.success("Artwork updated successfully!");

      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "all"], (oldData) => {
        if (!oldData) return [];
        return oldData.map((art) => (art.id === updatedArtwork.id ? updatedArtwork : art));
      });

      queryClient.invalidateQueries({ queryKey: ["my_artwork"] });
    },

    onError: () => {
      toast.error("Failed to update artwork.");
    },
  });
};

export default useUpdateArtwork;
