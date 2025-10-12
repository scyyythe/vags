import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const bulkUnhideExhibits = async (): Promise<{ message: string; count: number }> => {
  const response = await apiClient.patch("/exhibits/bulk-unhide/");
  return response.data;
};

const useBulkUnhideExhibits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUnhideExhibits,
    onSuccess: (data) => {
      // Invalidate all exhibit-related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["exhibit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["exhibits"] });
      queryClient.invalidateQueries({ queryKey: ["my-exhibit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["user-exhibits"] });
      queryClient.invalidateQueries({ queryKey: ["exhibit-card"] });
      queryClient.invalidateQueries({ queryKey: ["collaborator-exhibit-view"] });
      queryClient.invalidateQueries({ queryKey: ["exhibit-review"] });
      queryClient.invalidateQueries({ queryKey: ["exhibitReportStatus"] });
      queryClient.invalidateQueries({ queryKey: ["exhibitReportStatusBulk"] });

      toast.success(`Successfully unhid ${data.count} exhibits!`, {
        closeButton: true,
      });
    },
    onError: (error: any) => {
      console.error("Bulk unhide exhibits error:", error);
      toast.error("Failed to unhide exhibits.", {
        closeButton: true,
      });
    },
  });
};

export default useBulkUnhideExhibits;
