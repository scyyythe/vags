import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export const useExhibitLike = (exhibitId: string, initialIsLiked: boolean, initialLikeCount: number) => {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`exhibit-likes/${exhibitId}/`);
      return response.data;
    },
    onSuccess: (data) => {
      const { is_liked, like_count } = data;

      setIsLiked(is_liked);
      setLikeCount(like_count);

      toast.success(data.detail || (is_liked ? "You liked this exhibit." : "You unliked this exhibit."));

      // Invalidate all exhibit and related queries for real-time updates
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes("exhibit-cards") ||
              queryKey.includes("exhibit-card") ||
              queryKey.includes("my-exhibit-cards") ||
              queryKey.includes("exhibits") ||
              queryKey.includes("exhibit-review") ||
              queryKey.includes("collaborator-exhibit-view") ||
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
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));

      if (error.response) {
        toast.error(error.response.data.detail || "Failed to update the like status");
      } else if (error.request) {
        toast.error("No response from server.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    },
  });

  const toggleLike = () => {
    // ✅ Optimistic UI update
    setIsLiked((prevLiked) => {
      const newLiked = !prevLiked;
      setLikeCount((prevCount) => (newLiked ? prevCount + 1 : prevCount - 1));
      return newLiked;
    });

    mutation.mutate();
  };

  return {
    isLiked,
    likeCount,
    toggleLike,
    mutation,
  };
};
