import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { getLoggedInUserId } from "@/auth/decode";

const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const userId = getLoggedInUserId();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch("notifications/mark-all-read/");
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch notifications query to update the unread count
      queryClient.invalidateQueries({
        queryKey: ["notifications", userId],
      });
      toast.success(`${data.updated_count} notifications marked as read`);
    },
    onError: (error) => {
      toast.error("Failed to mark all notifications as read");
      console.error(error);
    },
  });
};

export default useMarkAllNotificationsAsRead;
