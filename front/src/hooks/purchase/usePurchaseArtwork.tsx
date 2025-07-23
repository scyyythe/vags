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
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
    },
  });
};

export default usePurchaseArtwork;
