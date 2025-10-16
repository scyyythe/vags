import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const ArchivedArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/archived/`);
  return response.data;
};

const useArchivedArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ArchivedArtwork(id),
    onSuccess: (_, id) => {
      toast.success("You've successfully archived the artwork");

      queryClient.setQueryData<Artwork[]>(["artworks", 1, undefined, "created-by-me"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((artwork) => artwork.id !== id);
      });

      queryClient.setQueriesData<Artwork[]>({ queryKey: ["artworks"] }, (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((artwork) => artwork.id !== id);
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["artworks"] });
        queryClient.invalidateQueries({ queryKey: ["artwork"] });
        queryClient.invalidateQueries({ queryKey: ["artwork-cards"] });
        queryClient.invalidateQueries({ queryKey: ["biddingArtworks"] });
        queryClient.invalidateQueries({ queryKey: ["trending-artworks"] });
        queryClient.invalidateQueries({ queryKey: ["popular-artworks"] });
        queryClient.invalidateQueries({ queryKey: ["myAuctionArtworks"] });
        queryClient.invalidateQueries({ queryKey: ["hotBids"] });
        queryClient.invalidateQueries({ queryKey: ["followedAuctions"] });
        queryClient.invalidateQueries({ queryKey: ["my-auctions"] });
        queryClient.invalidateQueries({ queryKey: ["myParticipatedAuctions"] });
        queryClient.invalidateQueries({ queryKey: ["auctions"] });

        // Invalidate marketplace queries to ensure archived artwork disappears from marketplace
        queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
        queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });
        queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
        queryClient.invalidateQueries({ queryKey: ["popularArtworks"] });
        queryClient.invalidateQueries({ queryKey: ["popular-artworks-light"] });
        queryClient.invalidateQueries({ queryKey: ["top-artworks"] });
        queryClient.invalidateQueries({ queryKey: ["top-sellers"] });
        queryClient.invalidateQueries({ queryKey: ["explore"] });
        queryClient.invalidateQueries({ queryKey: ["feed"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["user-artworks"] });
      }, 100);
    },
    onError: () => {
      toast.error("Failed to archived artwork.");
    },
  });
};

export default useArchivedArtwork;
