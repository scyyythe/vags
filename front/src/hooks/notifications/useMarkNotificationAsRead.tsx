import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { getLoggedInUserId } from "@/auth/decode";

const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const userId = getLoggedInUserId();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiClient.patch(`notifications/${notificationId}/mark-read/`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch notifications query to update the unread count
      queryClient.invalidateQueries({
        queryKey: ["notifications", userId],
      });
    },
    onError: (error) => {
      toast.error("Failed to mark notification as read");
      console.error(error);
    },
  });
};

export default useMarkNotificationAsRead;
