import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { User } from "@/hooks/users/useUserQuery";
interface BanPayload {
  userId: string;
  reason?: string;
  is_permanent?: boolean;
  end_date?: string;
}

const banUser = async ({ userId, reason, is_permanent = true, end_date }: BanPayload): Promise<User> => {
  try {
    console.log("Ban user payload:", { userId, reason, is_permanent, end_date });
    const response = await apiClient.post<User>(`/user/${userId}/ban/`, {
      reason,
      is_permanent,
      end_date,
    });
    console.log("Ban user response:", response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Ban user error response:", axiosError.response?.data);
    throw new Error((axiosError.response?.data as { detail?: string })?.detail || "Failed to ban user");
  }
};

const useBanUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, BanPayload>({
    mutationFn: banUser,
    onSuccess: (updatedUser, variables) => {
      queryClient.setQueryData<User>(["user", variables.userId], updatedUser);

      queryClient.setQueryData<User[]>(["all-users"], (oldUsers = []) =>
        oldUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );

      toast.success("User banned successfully.");
    },
    onError: (error) => {
      console.error("Error banning user:", error.message);
      toast.error(`Error: ${error.message}`);
    },
  });
};

export default useBanUserMutation;
