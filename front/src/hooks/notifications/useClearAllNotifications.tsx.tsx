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
    onError: (error: any) => {
      let errorMessage = "Failed to clear notifications";

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
      console.error("Clear notifications error:", error);
    },
  });
};

export default useClearAllNotifications;
