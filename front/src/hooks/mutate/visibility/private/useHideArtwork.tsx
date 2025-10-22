import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const hideArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/hide/`);
  return response.data;
};

const unhideArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/unhide/`);
  return response.data;
};

const useHideArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hideArtwork(id),
    onSuccess: async (_, id) => {
      toast.success("Artwork hidden successfully!");

      // Refetch all artwork-related queries for immediate real-time updates
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["artworks"] }),
        queryClient.refetchQueries({ queryKey: ["bulkReportStatus"] }),
        queryClient.refetchQueries({ queryKey: ["artworkReportStatus"] }),
        queryClient.refetchQueries({ queryKey: ["my-sell-art-cards"] }),
        queryClient.refetchQueries({ queryKey: ["marketplace-art-cards"] }),
        queryClient.refetchQueries({ queryKey: ["user-sell-art-cards"] }),
        
        // Refetch Explore page queries for immediate visibility
        queryClient.refetchQueries({ queryKey: ["explore"] }),
        queryClient.refetchQueries({ queryKey: ["trending-artworks"] }),
        queryClient.refetchQueries({ queryKey: ["popular-artworks"] }),
        queryClient.refetchQueries({ queryKey: ["followedArtworks"] }),
        queryClient.refetchQueries({ queryKey: ["feed"] }),
        queryClient.refetchQueries({ queryKey: ["profile"] }),
        queryClient.refetchQueries({ queryKey: ["user-artworks"] }),
        
        // Refetch specific artwork query
        queryClient.refetchQueries({ queryKey: ["art", id] }),
      ]);
    },
    onError: () => {
      toast.error("Failed to hide artwork.");
    },
  });
};

const useUnhideArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unhideArtwork(id), // Call the correct unhide endpoint
    onSuccess: async (_, id) => {
      toast.success("Artwork unhidden successfully!");

      // Refetch all artwork-related queries for immediate real-time updates
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["artworks"] }),
        queryClient.refetchQueries({ queryKey: ["bulkReportStatus"] }),
        queryClient.refetchQueries({ queryKey: ["artworkReportStatus"] }),
        queryClient.refetchQueries({ queryKey: ["my-sell-art-cards"] }),
        queryClient.refetchQueries({ queryKey: ["marketplace-art-cards"] }),
        queryClient.refetchQueries({ queryKey: ["user-sell-art-cards"] }),
        
        // Refetch Explore page queries for immediate visibility
        queryClient.refetchQueries({ queryKey: ["explore"] }),
        queryClient.refetchQueries({ queryKey: ["trending-artworks"] }),
        queryClient.refetchQueries({ queryKey: ["popular-artworks"] }),
        queryClient.refetchQueries({ queryKey: ["followedArtworks"] }),
        queryClient.refetchQueries({ queryKey: ["feed"] }),
        queryClient.refetchQueries({ queryKey: ["profile"] }),
        queryClient.refetchQueries({ queryKey: ["user-artworks"] }),
        
        // Refetch specific artwork query
        queryClient.refetchQueries({ queryKey: ["art", id] }),
      ]);
    },
    onError: () => {
      toast.error("Failed to unhide artwork.");
    },
  });
};

export default useHideArtwork;
export { useUnhideArtwork };
