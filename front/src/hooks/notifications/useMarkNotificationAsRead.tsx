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
    onMutate: async (notificationId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications", userId] });

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData(["notifications", userId]);

      // Optimistically update the notification to read
      queryClient.setQueryData(["notifications", userId], (old: any) => {
        if (!old) return old;
        return old.map((notification: any) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        );
      });

      // Return a context object with the snapshotted value
      return { previousNotifications };
    },
    onError: (err: any, notificationId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications", userId], context.previousNotifications);
      }

      let errorMessage = "Failed to mark notification as read";

      if (err?.response?.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (err?.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err?.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please check your connection.";
      } else if (err?.message?.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      toast.error(errorMessage);
      console.error("Mark notification as read error:", err);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({
        queryKey: ["notifications", userId],
      });
    },
  });
};

export default useMarkNotificationAsRead;
