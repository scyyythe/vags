import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export const useAuctionLike = (auctionId: string, initialIsLiked: boolean, initialLikeCount: number) => {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`auction-likes/${auctionId}/`);
      return response.data;
    },
    onSuccess: (data) => {
      const { is_liked, like_count, detail } = data;

      setIsLiked(is_liked);
      setLikeCount(like_count);
      toast(detail || (is_liked ? "You liked this auction." : "You unliked this auction."));

      queryClient.invalidateQueries({ queryKey: ["biddingArtworks"] });

      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
    },
    onError: (error) => {
      console.error("Failed to toggle like for auction:", error);
      toast("Failed to update like status.");
    },
  });

  const toggleLike = () => {
    mutation.mutate();
  };

  return {
    isLiked,
    likeCount,
    toggleLike,
  };
};
