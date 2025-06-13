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
  
      toast.success(
        data.detail || (data.is_Liked ? "You liked this exhibit." : "You unliked this exhibit.")
      );

    queryClient.invalidateQueries({
  queryKey: ["exhibit-card", exhibitId],
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
