import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

interface UnblockUserResponse {
  detail: string;
}

const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation<UnblockUserResponse, Error, string>({
    mutationFn: async (userId: string) => {
      const response = await apiClient.post(`/user/unblock/${userId}/`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch blocked users list
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    },
  });
};

export default useUnblockUser;