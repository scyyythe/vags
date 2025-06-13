import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

export const useExhibitLike = (
  exhibitId: string,
  initialIsLiked: boolean,
  initialLikeCount: number
) => {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`exhibit-likes/${exhibitId}/`);
      return response.data;
    },
    onSuccess: (data) => {
      const { is_Liked, like_count, detail } = data;
      setIsLiked(is_Liked);
      setLikeCount(like_count);
      toast.success(detail || (is_Liked ? "You liked this exhibit." : "You unliked this exhibit."));
    },
    onError: (error: any) => {
      console.error("Like API Error:", error);

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        toast.error(error.response.data.detail || "Failed to update the like status");
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server.");
      } else {
        console.error("Error setting up request:", error.message);
        toast.error("An unexpected error occurred.");
      }
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
