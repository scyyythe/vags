import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
interface FollowPayload {
  following: string;
}

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: FollowPayload) => {
      const response = await apiClient.post("follow/", payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Followed successfully", data);
      queryClient.invalidateQueries({ queryKey: ["followCounts", variables.following] });
    },
    onError: (error) => {
      toast.error("Follow error");
    },
  });
};
