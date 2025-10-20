import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExhibit, ExhibitPayload } from "./exhibit";
import { toast } from "sonner";

export const useCreateExhibit = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createExhibit,
    onSuccess: () => {
      toast.success("Exhibit created successfully!");

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
      if (error.message !== "Banner is required") {
        toast.error(`Error creating exhibit: ${error?.message || "Something went wrong"}`);
      }
    },
  });

  return mutation;
};
