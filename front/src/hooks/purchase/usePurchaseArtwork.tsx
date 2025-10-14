import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

type PurchasePayload = {
  artwork_id: string;
  payment_method: string;
  is_paid?: boolean;
  quantity?: number;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    phone: string;
  };
};

const usePurchaseArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PurchasePayload) => {
      return apiClient.post("/purchase/", payload);
    },
    onSuccess: () => {
      // Invalidate all relevant marketplace queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["trending-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ queryKey: ["popular-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["popularArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["popular-artworks-light"] });
      queryClient.invalidateQueries({ queryKey: ["top-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["top-sellers"] });
      queryClient.invalidateQueries({ queryKey: ["my-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["my-sold-artworks"] });
    },
  });
};

export default usePurchaseArtwork;
