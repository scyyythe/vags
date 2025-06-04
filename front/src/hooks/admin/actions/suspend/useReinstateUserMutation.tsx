import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { User } from "@/hooks/users/useUserQuery";

const reinstateUser = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.post<User>(`/user/${userId}/reinstate/`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error((axiosError.response?.data as { detail?: string })?.detail || "Failed to reinstate user");
  }
};

const useReinstateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, string>({
    mutationFn: reinstateUser,
    onSuccess: (updatedUser, userId) => {
      queryClient.setQueryData<User>(["user", userId], updatedUser);
      queryClient.setQueryData<User[]>(["all-users"], (oldUsers = []) =>
        oldUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      toast.success("User reinstated successfully.");
    },
    onError: (error) => {
      console.error("Error reinstating user:", error.message);
      toast.error(`Error: ${error.message}`);
    },
  });
};

export default useReinstateUserMutation;
