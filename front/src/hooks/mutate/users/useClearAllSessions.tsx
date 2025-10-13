import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

interface ClearAllSessionsResponse {
  message: string;
  deleted_count: number;
}

const clearAllSessions = async (): Promise<ClearAllSessionsResponse> => {
  const response = await apiClient.delete("/sessions/clear-all/");
  return response.data;
};

const useClearAllSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearAllSessions,
    onSuccess: (data) => {
      toast.success(data.message, { closeButton: true });

      // Invalidate sessions query to refresh the sessions list
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (error: any) => {
      console.error("❌ Clear all sessions error:", error.response?.data || error.message);

      if (error.response?.data?.error) {
        toast.error("Failed to clear sessions: " + error.response.data.error, { closeButton: true });
      } else {
        toast.error("Failed to clear all sessions. Please try again.", { closeButton: true });
      }
    },
  });
};

export default useClearAllSessions;
