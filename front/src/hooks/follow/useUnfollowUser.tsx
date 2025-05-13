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
      queryClient.invalidateQueries({ queryKey: ["followCounts", variables.following] });
    },
    onError: (error) => {
      toast.error("Unfollow error");
    },
  });
};
