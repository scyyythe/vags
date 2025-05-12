import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
interface FollowPayload {
  following: string;
}

export const useFollowUser = () => {
  return useMutation({
    mutationFn: async (payload: FollowPayload) => {
      const response = await apiClient.post("follow/", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Followed successfully:", data);
    },
    onError: (error) => {
      toast.error("Follow error");
    },
  });
};
