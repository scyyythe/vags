import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

interface SuspendPayload {
  userId: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

const suspendUser = async ({ userId, start_date, end_date, reason }: SuspendPayload): Promise<void> => {
  try {
    await apiClient.post(`/user/${userId}/suspend/`, {
      start_date,
      end_date,
      reason,
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error((axiosError.response?.data as { detail?: string })?.detail || "Failed to suspend user");
  }
};

const useSuspendUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: suspendUser,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["all-users"] });

      toast.success("User suspended successfully.");
    },
    onError: (error: Error) => {
      console.error("Error suspending user:", error.message);
      toast.error(`Error: ${error.message}`);
    },
  });
};

export default useSuspendUserMutation;
