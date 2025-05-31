import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

interface BlockUserResponse {
  detail: string;
}

const blockUser = async (userId: string): Promise<BlockUserResponse> => {
  const response = await apiClient.post(`/user/${userId}/block/`);
  return response.data;
};

const useBlockUser = (): UseMutationResult<BlockUserResponse, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation<BlockUserResponse, Error, string>({
    mutationFn: blockUser,
    onSuccess: (data, userId) => {
      toast.success(data.detail || "User blocked successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["followCounts", userId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to block user.");
      console.error(error);
    },
  });
};

export default useBlockUser;
