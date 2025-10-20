// useUpdateExhibit.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExhibit } from "./edit-exhibit";
import { toast } from "sonner";
export const useUpdateExhibit = (exhibitId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => updateExhibit(exhibitId, data),
    onSuccess: (updatedExhibit) => {
      // console.log("✅ Exhibit updated response:", updatedExhibit);
      // console.log("🎨 Artworks after update:", updatedExhibit.artworks);
      // console.log("👥 Collaborators after update:", updatedExhibit.collaborators);

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
      console.error("❌ Error updating exhibit:", error);
      toast.error(`Error updating exhibit: ${error?.message || "Something went wrong"}`);
    },
  });
};
