import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/utils/apiClient";
import { User } from "@/hooks/users/useUserQuery";
import { toast } from "sonner";

const demoteUser = async (userId: string): Promise<User> => {
  const response = await apiClient.patch<User>(`/user/${userId}/demote/`);
  return response.data;
};

const useDemoteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: demoteUser,
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["user", updatedUser.id] });
      queryClient.invalidateQueries({ queryKey: ["all-users"] });

      toast.success(`User demoted to ${updatedUser.role} successfully!`);
    },
    onError: (error: Error) => {
      console.error("Error demoting user:", error.message);
      toast.error(`Error: ${error.message}`);
    },
  });
};

export default useDemoteUserMutation;
