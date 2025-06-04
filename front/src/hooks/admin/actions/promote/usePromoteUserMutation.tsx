import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/utils/apiClient";
import { User } from "@/hooks/users/useUserQuery";
import { toast } from "sonner";
const promoteUser = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.patch<User>(`/user/${userId}/promote/`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error((axiosError.response?.data as { detail?: string })?.detail || "Failed to promote user");
  }
};

const usePromoteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: promoteUser,
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["user", updatedUser.id] });
      queryClient.invalidateQueries({ queryKey: ["all-users"] });

      toast.success(`User promoted to ${updatedUser.role} successfully!`);
    },
    onError: (error: Error) => {
      console.error("Error promoting user:", error.message);

      toast.error(`Error: ${error.message}`);
    },
  });
};

export default usePromoteUserMutation;
