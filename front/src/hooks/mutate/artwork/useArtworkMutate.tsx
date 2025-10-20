import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const updateArtwork = async ({ id, formData }: { id: string; formData: FormData }): Promise<Artwork> => {
  for (const pair of formData.entries()) {
    console.log(`${pair[0]}:`, pair[1]);
  }
  const response = await apiClient.patch(`/art/${id}/update/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const useUpdateArtwork = (currentPage: number, isActive: boolean, category: string, visibility: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: string; formData: FormData }) => updateArtwork(payload),

    onSuccess: (updatedArtwork) => {
      toast.success("Artwork updated successfully!");

      // Update specific artwork in cache
      queryClient.setQueryData<Artwork[]>(
        ["artworks", currentPage, undefined, isActive, category, visibility],
        (oldData) => {
          if (!oldData) return [];
          return oldData.map((art) => (art.id === updatedArtwork.id ? updatedArtwork : art));
        }
      );

      // Invalidate all artwork-related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("my-sell-art-cards") ||
              queryKey.includes("marketplace-art-cards") ||
              queryKey.includes("my-sold-artworks") ||
              queryKey.includes("user-sell-art-cards") ||
              queryKey.includes("auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks"))
          );
        },
      });
    },

    onError: () => {
      toast.error("Failed to update artwork.");
    },
  });
};

export default useUpdateArtwork;
