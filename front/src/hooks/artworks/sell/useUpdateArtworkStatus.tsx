import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

type UpdateArtworkStatusInput = {
  artworkId: string;
  price?: string;
  quantity?: string;
  edition?: string;
  additionalImages?: File[];
};

const useUpdateArtworkStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ artworkId, price, quantity, edition, additionalImages }: UpdateArtworkStatusInput) => {
      const formData = new FormData();
      formData.append("art_status", "onSale");
      if (price) formData.append("price", price);
      if (quantity) formData.append("quantity", quantity);

      if (edition) formData.append("edition", edition);

      if (additionalImages && additionalImages.length > 0) {
        additionalImages.forEach((file) => {
          formData.append("image_url", file);
        });
      }

      const { data } = await apiClient.patch(`/art/${artworkId}/update/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Artwork updated and listed for sale!", { closeButton: true });
      queryClient.invalidateQueries({ queryKey: ["my-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
    },
    onError: () => {
      toast.error("Failed to update artwork.", { closeButton: true });
    },
  });
};

export default useUpdateArtworkStatus;
