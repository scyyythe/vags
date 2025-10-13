import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { getLoggedInUserId } from "@/auth/decode";

const useClearAllNotifications = (onLocalClear: () => void) => {
  const queryClient = useQueryClient();
  const userId = getLoggedInUserId();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete("notifications/delete-all/");
      return response.data;
    },
    onSuccess: () => {
      onLocalClear();

      // Invalidate and refetch notifications query
      queryClient.invalidateQueries({
        queryKey: ["notifications", userId],
      });

      toast.success("All notifications cleared!");
    },
    onError: (error) => {
      toast.error("Failed to clear notifications");
      console.error(error);
    },
  });
};

export default useClearAllNotifications;
