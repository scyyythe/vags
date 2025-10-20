import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export const usePublishExhibit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exhibitId: string) => {
      const response = await apiClient.patch(`/exhibits/${exhibitId}/publish/`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Exhibit published successfully!");

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
              queryKey.includes("pending-requests") ||
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
      const message = error?.response?.data?.detail || "Failed to publish exhibit.";
      toast.error(message);
    },
  });
};
