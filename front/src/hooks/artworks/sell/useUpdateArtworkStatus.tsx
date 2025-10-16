import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

type UpdateArtworkStatusInput = {
  artworkId: string;
  price?: string;
  quantity?: string;
  edition?: string;
  additionalImages?: File[];
  yearCreated?: string;
};

const useUpdateArtworkStatus = (
  currentPage?: number,
  userId?: string,
  endpointType: "all" | "created-by-me" | "specific-user" = "all",
  filterVisibility?: "public" | "private" | "hidden" | "deleted" | "archived",
  onlyActivePublic: boolean = false
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      artworkId,
      price,
      quantity,
      edition,
      additionalImages,
      yearCreated,
    }: UpdateArtworkStatusInput) => {
      const formData = new FormData();
      formData.append("art_status", "onSale");
      if (price) formData.append("price", price);
      if (quantity) formData.append("quantity", quantity);
      if (edition) formData.append("edition", edition);
      if (yearCreated) formData.append("year_created", yearCreated);

      if (additionalImages && additionalImages.length > 0) {
        additionalImages.forEach((file) => formData.append("additional_images", file));
      }

      const { data } = await apiClient.patch(`/art/${artworkId}/update/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Artwork updated and listed for sale!", { closeButton: true });

      queryClient.invalidateQueries({
        queryKey: ["artworks"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["my-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });

      // Force immediate refetch of marketplace data
      queryClient.refetchQueries({ queryKey: ["marketplace-art-cards"] });
    },
    onError: () => {
      toast.error("Failed to update artwork.", { closeButton: true });
    },
  });
};

export default useUpdateArtworkStatus;
