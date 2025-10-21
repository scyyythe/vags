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
    onError: (error: any) => {
      let errorMessage = "Failed to mark all notifications as read";

      if (error?.response?.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (error?.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error?.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please check your connection.";
      } else if (error?.message?.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      toast.error(errorMessage);
      console.error("Mark all notifications as read error:", error);
    },
  });
};

export default useMarkAllNotificationsAsRead;
