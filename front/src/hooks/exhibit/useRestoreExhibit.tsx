import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { AxiosError } from "axios";

const restoreExhibit = async (exhibitId: string) => {
  if (!exhibitId) throw new Error("Exhibit ID is required for restoration.");

  const response = await apiClient.patch(`/exhibits/${exhibitId}/restore/`);
  return response.data;
};

export const useRestoreExhibit = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreExhibit,

    onSuccess: (_, exhibitId) => {
      toast.success("Exhibit restored successfully");

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

      if (onSuccessCallback) onSuccessCallback();
    },

    onError: (error: unknown) => {
      console.error("Restore error", error);

      if (error instanceof AxiosError) {
        const message = error.response?.data?.detail || error.response?.data?.error || "Failed to restore exhibit.";
        toast.error(message);
      } else {
        toast.error("Failed to restore exhibit.");
      }
    },
  });
};
