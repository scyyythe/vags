// frontend/hooks/exhibit/useToggleVisibilityExhibit.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export const useToggleVisibilityExhibit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exhibitId: string) => {
      const response = await apiClient.patch(`/exhibits/${exhibitId}/toggle-visibility/`);
      return response.data;
    },
    onSuccess: (data, exhibitId) => {
      toast.success(data.detail);
      // Invalidate all exhibit and related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("exhibit-cards") ||
              queryKey.includes("my-exhibit-cards") ||
              queryKey.includes("exhibit-card") ||
              queryKey.includes("exhibit-review") ||
              queryKey.includes("collaborator-exhibit-view") ||
              queryKey.includes("exhibits") ||
              queryKey.includes("notifications") ||
              queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks"))
          );
        },
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to toggle exhibit visibility.");
    },
  });
};
