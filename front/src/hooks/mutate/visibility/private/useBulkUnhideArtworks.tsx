import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";

const bulkUnhideArtworks = async (): Promise<{ message: string; count: number }> => {
  const response = await apiClient.patch("/art/bulk-unhide/");
  return response.data;
};

const useBulkUnhideArtworks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUnhideArtworks,
    onSuccess: (data) => {
      // Invalidate all artwork queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ queryKey: ["artwork"] });

      toast.success(`Successfully unhid ${data.count} artworks!`, {
        closeButton: true,
      });
    },
    onError: (error: any) => {
      console.error("Bulk unhide error:", error);
      toast.error("Failed to unhide artworks.", {
        closeButton: true,
      });
    },
  });
};

export default useBulkUnhideArtworks;
