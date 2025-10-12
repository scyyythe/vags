import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
import { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";

const unarchiveArtwork = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/art/${id}/unarchived/`);
  return response.data;
};

const useUnarchiveArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unarchiveArtwork(id),
    onSuccess: (_, id) => {
      toast.success("Artwork unarchived!");

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
      }, 100);
    },
    onError: () => {
      toast.error("Failed to unarchive artwork.");
    },
  });
};

export default useUnarchiveArtwork;
