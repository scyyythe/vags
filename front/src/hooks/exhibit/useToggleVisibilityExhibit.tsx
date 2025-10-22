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
    onMutate: async (exhibitId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["exhibit-cards"] });
      await queryClient.cancelQueries({ queryKey: ["my-exhibit-cards"] });

      // Snapshot the previous values for all possible query variations
      const previousExhibitCards = queryClient.getQueryData(["exhibit-cards"]);
      const previousMyExhibitCards = queryClient.getQueryData(["my-exhibit-cards"]);
      const previousMyExhibitCardsWithDeleted = queryClient.getQueryData(["my-exhibit-cards", true, false, false]);
      const previousMyExhibitCardsWithHidden = queryClient.getQueryData(["my-exhibit-cards", false, true, false]);
      const previousMyExhibitCardsWithArchived = queryClient.getQueryData(["my-exhibit-cards", false, false, true]);

      // Optimistically update the exhibit cards by removing the unpublished exhibit
      queryClient.setQueryData(["exhibit-cards"], (old: any) => {
        if (!old) return old;
        return old.filter((exhibit: any) => exhibit.id !== exhibitId);
      });

      // Update all variations of my-exhibit-cards queries
      queryClient.setQueryData(["my-exhibit-cards"], (old: any) => {
        if (!old) return old;
        return old.filter((exhibit: any) => exhibit.id !== exhibitId);
      });

      queryClient.setQueryData(["my-exhibit-cards", true, false, false], (old: any) => {
        if (!old) return old;
        return old.filter((exhibit: any) => exhibit.id !== exhibitId);
      });

      queryClient.setQueryData(["my-exhibit-cards", false, true, false], (old: any) => {
        if (!old) return old;
        return old.filter((exhibit: any) => exhibit.id !== exhibitId);
      });

      queryClient.setQueryData(["my-exhibit-cards", false, false, true], (old: any) => {
        if (!old) return old;
        return old.filter((exhibit: any) => exhibit.id !== exhibitId);
      });

      // Return a context object with the snapshotted values
      return { 
        previousExhibitCards, 
        previousMyExhibitCards,
        previousMyExhibitCardsWithDeleted,
        previousMyExhibitCardsWithHidden,
        previousMyExhibitCardsWithArchived
      };
    },
    onError: (error: any, exhibitId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousExhibitCards) {
        queryClient.setQueryData(["exhibit-cards"], context.previousExhibitCards);
      }
      if (context?.previousMyExhibitCards) {
        queryClient.setQueryData(["my-exhibit-cards"], context.previousMyExhibitCards);
      }
      if (context?.previousMyExhibitCardsWithDeleted) {
        queryClient.setQueryData(["my-exhibit-cards", true, false, false], context.previousMyExhibitCardsWithDeleted);
      }
      if (context?.previousMyExhibitCardsWithHidden) {
        queryClient.setQueryData(["my-exhibit-cards", false, true, false], context.previousMyExhibitCardsWithHidden);
      }
      if (context?.previousMyExhibitCardsWithArchived) {
        queryClient.setQueryData(["my-exhibit-cards", false, false, true], context.previousMyExhibitCardsWithArchived);
      }
      toast.error(error?.response?.data?.detail || "Failed to toggle exhibit visibility.");
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
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["exhibit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["my-exhibit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["my-exhibit-cards", true, false, false] });
      queryClient.invalidateQueries({ queryKey: ["my-exhibit-cards", false, true, false] });
      queryClient.invalidateQueries({ queryKey: ["my-exhibit-cards", false, false, true] });
    },
  });
};
