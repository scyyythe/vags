import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
interface UnfollowPayload {
  following: string;
}

export const useUnfollowUser = () => {
  return useMutation({
    mutationFn: async (payload: UnfollowPayload) => {
      const response = await apiClient.post("unfollow/", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Unfollowed successfully:", data);
    },
    onError: (error) => {
      toast.error("Unfollow error");
    },
  });
};
