import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const useClearAllNotifications = (onLocalClear: () => void) => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete("notifications/delete-all/");
      return response.data;
    },
    onSuccess: () => {
      onLocalClear();
      toast.success("All notifications cleared!");
    },
    onError: (error) => {
      toast.error("Failed to clear notifications");
      console.error(error);
    },
  });
};

export default useClearAllNotifications;
