import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

interface UnfollowPayload {
  following: string;
}

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UnfollowPayload) => {
      const response = await apiClient.post("unfollow/", payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Unfollowed successfully", data);
      // Invalidate all follow-related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("followStatus") ||
              queryKey.includes("followCounts") ||
              queryKey.includes("followers") ||
              queryKey.includes("following") ||
              queryKey.includes("notifications") ||
              queryKey.includes("artworks") ||
              queryKey.includes("popularArtworks") ||
              queryKey.includes("explore") ||
              queryKey.includes("feed") ||
              queryKey.includes("profile") ||
              queryKey.includes("user-artworks") ||
              queryKey.includes("exhibits") ||
              queryKey.includes("exhibit-cards") ||
              queryKey.includes("my-exhibit-cards") ||
              queryKey.includes("auctions") ||
              queryKey.includes("biddingArtworks") ||
              queryKey.includes("followedAuctions") ||
              queryKey.includes("myAuctionArtworks"))
          );
        },
      });
    },
    onError: (error) => {
      toast.error("Unfollow error");
    },
  });
};
